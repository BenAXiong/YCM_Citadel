import tkinter as tk
from tkinter import ttk, messagebox
import json
import os
import sys
import subprocess
import threading
from collections import defaultdict
import sqlite3

# Fix import issue
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

class KlokahMasterApp(tk.Tk):
    def __init__(self, db_path):
        super().__init__()
        self.title("Yincumin Citadel - Hub v4.1")
        self.geometry("1650x980")
        self.db_path = db_path
        
        # State
        self.selected_dialects = set()
        self.is_loading = True
        self.current_theme = "MATRIX" 
        self.show_full_only = tk.BooleanVar(value=False)
        self.source_master = tk.StringVar(value="ALL")
        self.source_sub = tk.StringVar(value="ALL")
        
        # Cache
        self.glid_to_dialects = defaultdict(list)
        self.dialect_to_glid = {}
        self.glid_names = {}
        
        self.setup_styles()
        self.setup_ui()
        self.bind_all("<MouseWheel>", self.on_mouse_wheel)
        
        threading.Thread(target=self.load_metadata, daemon=True).start()

    def setup_styles(self):
        self.style = ttk.Style()
        self.style.theme_use("clam")
        self.apply_theme()

    def apply_theme(self):
        if self.current_theme == "MATRIX":
            self.colors = {"bg": "#000000", "surf": "#0a0a0a", "accent": "#00ff88", "text": "#ffffff", "sub": "#00ff88", "side_txt": "#00ff88", "tab_sel": "#00ff88"}
        else: # STEEL
            self.colors = {"bg": "#111", "surf": "#1a1a1a", "accent": "#ffffff", "text": "#e0e0e0", "sub": "#777", "side_txt": "#ffffff", "tab_sel": "#ffffff"}
        
        c = self.colors
        self.configure(bg=c["bg"])
        self.style.configure("TNotebook", background=c["bg"], borderwidth=0)
        self.style.configure("TNotebook.Tab", background=c["surf"], foreground=c["sub"], padding=[15, 8], font=("Consolas", 10))
        self.style.map("TNotebook.Tab", background=[("selected", c["bg"])], foreground=[("selected", c["accent"])])
        
        self.style.configure("Treeview", background=c["surf"], foreground=c["text"], fieldbackground=c["surf"], rowheight=35, borderwidth=0)
        self.style.map("Treeview", background=[("selected", "#222" if self.current_theme == "MATRIX" else "#333")], 
                                  foreground=[("selected", c["accent"])])
        self.style.configure("Treeview.Heading", background="#111" if self.current_theme == "MATRIX" else "#1a1a1a", 
                                             foreground=c["accent"], font=("Consolas", 10, "bold"), borderwidth=0)
        
        self.style.configure("TFrame", background=c["bg"])
        self.style.configure("TLabel", background=c["bg"], foreground=c["text"])
        self.style.configure("TEntry", fieldbackground=c["surf"], foreground=c["text"], insertcolor=c["text"])
        self.style.configure("TCombobox", fieldbackground=c["surf"], background=c["surf"], foreground=c["text"])
        
        if hasattr(self, "status_label"): 
            self.status_label.configure(bg="#000", fg=c["accent"] if not self.is_loading else "#444")
        if hasattr(self, "header_label"):
            self.header_label.configure(bg="#000", fg=c["accent"])
        if hasattr(self, "filter_label"):
            self.filter_label.configure(bg="#0a0a0a", fg=c["side_txt"])

    def toggle_theme(self):
        self.current_theme = "STEEL" if self.current_theme == "MATRIX" else "MATRIX"
        self.apply_theme()

    def setup_ui(self):
        # Top Header
        header = tk.Frame(self, bg="#000000")
        header.pack(fill="x")
        self.header_label = tk.Label(header, text="YINCUMIN_CITADEL_HUB // v4.1", bg="#000000", fg="#00ff88", font=("Consolas", 18, "bold"))
        self.header_label.pack(side="left", padx=25, pady=20)
        
        # Source Filters
        f_frame = tk.Frame(header, bg="#000")
        f_frame.pack(side="left", padx=30)
        
        lbl_s = tk.Label(f_frame, text="REALM:", font=("Fixedsys", 7), bg="#000", fg="gray")
        lbl_s.grid(row=0, column=0); self.master_cb = ttk.Combobox(f_frame, textvariable=self.source_master, values=["ALL", "KLOKAH", "ILRDF"], width=12)
        self.master_cb.grid(row=1, column=0, padx=5); self.master_cb.bind("<<ComboboxSelected>>", lambda e: self.refresh_all())
        
        tk.Label(f_frame, text="MODULE:", font=("Fixedsys", 7), bg="#000", fg="gray").grid(row=0, column=1)
        self.sub_cb = ttk.Combobox(f_frame, textvariable=self.source_sub, values=["ALL", "grmpts", "essay", "nine_year", "twelve", "dialogue", "vocabulary_stc"], width=15)
        self.sub_cb.grid(row=1, column=1, padx=5)
        self.sub_cb.bind("<<ComboboxSelected>>", lambda e: self.refresh_all())

        self.status_var = tk.StringVar(value="MOUNTING...")
        self.status_label = tk.Label(header, textvariable=self.status_var, bg="#000000", fg="#444444", font=("Consolas", 10))
        self.status_label.pack(side="right", padx=25)
        
        tk.Button(header, text="🌓 THEME", command=self.toggle_theme, bg="#222", fg="white", font=("Fixedsys", 9)).pack(side="right", padx=10)

        # Main Layout
        container = tk.Frame(self, bg="#000000")
        container.pack(fill="both", expand=True)
        
        # SIDEBAR Overhaul (Family Separation)
        self.sidebar_frame = tk.Frame(container, bg="#0a0a0a", width=550)
        self.sidebar_frame.pack(side="left", fill="y", padx=5, pady=5)
        self.filter_label = tk.Label(self.sidebar_frame, text="SOVEREIGN_FILTERS", bg="#0a0a0a", fg="#00ff88", font=("Consolas", 10, "bold"))
        self.filter_label.pack(pady=10)
        
        bw = tk.Frame(self.sidebar_frame, bg="#0a0a0a")
        bw.pack(fill="x", padx=15, pady=5)
        tk.Button(bw, text="ALL", command=self.select_all, bg="#222", fg="white", font=("Fixedsys", 9)).pack(side="left", expand=True, fill="x", padx=2)
        tk.Button(bw, text="NONE", command=self.select_none, bg="#222", fg="white", font=("Fixedsys", 9)).pack(side="left", expand=True, fill="x", padx=2)
        
        self.canvas = tk.Canvas(self.sidebar_frame, bg="#0a0a0a", highlightthickness=0)
        self.filter_inner = tk.Frame(self.canvas, bg="#0a0a0a")
        self.sb = ttk.Scrollbar(self.sidebar_frame, orient="vertical", command=self.canvas.yview)
        self.canvas.configure(yscrollcommand=self.sb.set)
        
        self.sb.pack(side="right", fill="y")
        self.canvas.pack(side="left", fill="both", expand=True)
        # Store window ID for resizing
        self.canvas_window = self.canvas.create_window((0,0), window=self.filter_inner, anchor="nw")
        
        # Binding to ensure inner frame takes full width
        self.canvas.bind("<Configure>", lambda event: self.canvas.itemconfig(self.canvas_window, width=event.width))
        self.filter_inner.bind("<Configure>", lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all")))

        # NOTEBOOK
        self.notebook = ttk.Notebook(container)
        self.notebook.pack(side="right", fill="both", expand=True, padx=5, pady=5)
        
        # TAB 1: VS-1
        self.tab_vs1 = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_vs1, text=" VS-1. GLOBAL EXPLORER ")
        
        sch = tk.Frame(self.tab_vs1, bg="#111")
        sch.pack(fill="x", padx=15, pady=15)
        tk.Label(sch, text="SEARCH (AB/ZH):", bg="#111", fg="#fff", font=("Consolas", 10)).pack(side="left", padx=10)
        self.search_var = tk.StringVar()
        self.search_var.trace_add("write", lambda *a: self.refresh_vs1())
        ttk.Entry(sch, textvariable=self.search_var, width=60).pack(side="left", padx=10)
        
        tk.Checkbutton(sch, text="[FULL_PIVOT]", variable=self.show_full_only, bg="#111", fg="#00ff88", 
                       font=("Consolas", 9), command=self.refresh_vs1, activebackground="#000", selectcolor="#000").pack(side="left", padx=30)

        s_cont = tk.Frame(self.tab_vs1)
        s_cont.pack(fill="both", expand=True, padx=15)
        self.s_tree = ttk.Treeview(s_cont, columns=["zh"], show="headings")
        self.s_tree.grid(row=0, column=0, sticky="nsew")
        ssb = ttk.Scrollbar(s_cont, orient="vertical", command=self.s_tree.yview)
        self.s_tree.configure(yscrollcommand=ssb.set)
        ssb.grid(row=0, column=1, sticky="ns")
        s_cont.grid_columnconfigure(0, weight=1); s_cont.grid_rowconfigure(0, weight=1)
        self.s_tree.bind("<Double-1>", lambda e: self.on_double_click(e, self.s_tree))

        # TAB 2: VS-2
        self.tab_vs2 = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_vs2, text=" VS-2. SYLLABUS ALIGN ")
        
        ctl = tk.Frame(self.tab_vs2, bg="#0a0a0a")
        ctl.pack(fill="x", pady=20)
        tk.Label(ctl, text="LEVEL (1-12):", bg="#0a0a0a", fg="#ffffff", font=("Consolas", 10)).grid(row=0, column=0, padx=15)
        self.lvl_spin = tk.Spinbox(ctl, from_=1, to=12, width=10, bg="#333", fg="white", command=self.refresh_vs2); self.lvl_spin.grid(row=0, column=1)
        tk.Label(ctl, text="LESSON:", bg="#0a0a0a", fg="#ffffff", font=("Consolas", 10)).grid(row=0, column=2, padx=15)
        self.les_spin = tk.Spinbox(ctl, from_=1, to=20, width=10, bg="#333", fg="white", command=self.refresh_vs2); self.les_spin.grid(row=0, column=3)
        ttk.Button(ctl, text="FORCE SYNC", command=self.refresh_vs2).grid(row=0, column=4, padx=50)

        v_cont = tk.Frame(self.tab_vs2)
        v_cont.pack(fill="both", expand=True, padx=15)
        self.v_tree = ttk.Treeview(v_cont, columns=["zh"], show="headings")
        self.v_tree.grid(row=0, column=0, sticky="nsew")
        vsb = ttk.Scrollbar(v_cont, orient="vertical", command=self.v_tree.yview)
        self.v_tree.configure(yscrollcommand=vsb.set)
        vsb.grid(row=0, column=1, sticky="ns")
        v_cont.grid_columnconfigure(0, weight=1); v_cont.grid_rowconfigure(0, weight=1)
        self.v_tree.bind("<Double-1>", lambda e: self.on_double_click(e, self.v_tree))
        
        # Bottom Audio Plate
        self.audio_plate = tk.Frame(self, bg="#050505", height=60)
        self.audio_plate.pack(fill="x")
        self.audio_info = tk.Label(self.audio_plate, text="READY_FOR_COMMUNICATION", bg="#050505", fg="#444", font=("Consolas", 9))
        self.audio_info.pack(side="left", padx=20, pady=10)

    def load_metadata(self):
        try:
            conn = sqlite3.connect(self.db_path)
            cur = conn.cursor()
            cur.execute("SELECT glid, group_name, sub_dialects FROM dialects ORDER BY glid")
            for glid, group, subs in cur.fetchall():
                self.glid_names[glid] = group
                sub_list = [s.strip() for s in subs.split(",")]
                self.glid_to_dialects[glid] = sub_list
                for s in sub_list: self.dialect_to_glid[s] = glid
            conn.close()
            self.after(0, self.on_metadata_ready)
        except Exception as e: self.after(0, lambda err=e: self.status_var.set(f"CITADEL_BLOCKED: {err}"))

    def on_metadata_ready(self):
        self.is_loading = False
        self.status_var.set("CITADEL_ONLINE")
        self.status_label.configure(fg="#00ff88")
        self.populate_filters()
        self.refresh_all()

    def select_all(self):
        for v in self.dia_vars.values(): v.set(True)
        self.selected_dialects = set(self.dialect_to_glid.keys())
        self.refresh_all()

    def select_none(self):
        for v in self.dia_vars.values(): v.set(False)
        self.selected_dialects = set()
        self.refresh_all()

    def populate_filters(self):
        print("DEBUG: Populating filters...")
        self.status_var.set("POPULATING_FILTERS...")
        self.update_idletasks()
        
        for c in self.filter_inner.winfo_children(): c.destroy()
        self.dia_vars = {}
        
        # Grid weights for the inner frame to ensure columns expand
        self.filter_inner.grid_columnconfigure(0, weight=1)
        self.filter_inner.grid_columnconfigure(1, weight=1)

        left_col = tk.Frame(self.filter_inner, bg="#0a0a0a")
        left_col.grid(row=0, column=0, sticky="nsew", padx=5) # nsew to fill
        right_col = tk.Frame(self.filter_inner, bg="#0a0a0a")
        right_col.grid(row=0, column=1, sticky="nsew", padx=5) # nsew to fill
        
        glids = sorted(self.glid_to_dialects.keys())
        for i, glid in enumerate(glids):
            target_col = left_col if i % 2 == 0 else right_col
            f_box = tk.Frame(target_col, bg="#0a0a0a", highlightthickness=1, highlightbackground="#222")
            f_box.pack(fill="x", pady=5, padx=5)
            
            g_name = self.glid_names[glid]
            lbl = tk.Label(f_box, text=f" [{glid}] {g_name} ", bg="#222", fg="#00ff88", 
                           font=("Consolas", 8, "bold"), anchor="w", cursor="hand2")
            lbl.pack(fill="x")
            lbl.bind("<Button-1>", lambda e, g=glid: self.toggle_group(g))
            
            sub_f = tk.Frame(f_box, bg="#0a0a0a")
            sub_f.pack(fill="x", padx=10, pady=5)
            
            for dia in self.glid_to_dialects[glid]:
                # Seed with Amis and Squliq
                var = tk.BooleanVar(value=("阿美" in dia or "賽考利克" in dia)) 
                if var.get(): self.selected_dialects.add(dia)
                self.dia_vars[dia] = var
                cb = tk.Checkbutton(sub_f, text=dia, variable=var, bg="#0a0a0a", fg="#aaaaaa", selectcolor="#000",
                               font=("Microsoft JhengHei", 7), activebackground="#111", activeforeground="white",
                               anchor="w", command=lambda d=dia: self.toggle_dialect(d))
                cb.pack(fill="x")
        
        # Force refresh layout
        self.update_idletasks()
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        # Force window width to match canvas
        self.canvas.itemconfig(self.canvas_window, width=self.canvas.winfo_width())
        self.status_var.set("CITADEL_ONLINE")
        print(f"DEBUG: Filters populated. Dialects tracked: {len(self.dia_vars)}")

    def toggle_group(self, glid):
        dialects = self.glid_to_dialects[glid]
        all_on = all(self.dia_vars[d].get() for d in dialects)
        for d in dialects:
            self.dia_vars[d].set(not all_on)
            if not all_on: self.selected_dialects.add(d)
            else: self.selected_dialects.discard(d)
        self.refresh_all()

    def toggle_dialect(self, dia):
        if self.dia_vars[dia].get(): self.selected_dialects.add(dia)
        else: self.selected_dialects.discard(dia)
        self.refresh_all()

    def refresh_all(self):
        self.refresh_vs1(); self.refresh_vs2()

    def on_mouse_wheel(self, event):
        if self.sidebar_frame.winfo_containing(event.x_root, event.y_root):
            self.canvas.yview_scroll(int(-1*(event.delta/120)), "units")

    def refresh_vs1(self):
        if self.is_loading: return
        q = self.search_var.get().strip()
        sel = sorted(list(self.selected_dialects))
        self.s_tree["columns"] = ["zh"] + sel
        self.s_tree.heading("zh", text="SEMANTICS (ZH/AB)"); self.s_tree.column("zh", width=350)
        for d in sel: self.s_tree.heading(d, text=d); self.s_tree.column(d, width=280)
        self.s_tree.delete(*self.s_tree.get_children())
        if not q or len(q) < 1: return
        
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        sel_glids = list(set(self.dialect_to_glid[d] for d in sel))
        if not sel_glids: return
        
        src_master = self.source_master.get()
        src_sub = self.source_sub.get()
        where_src = ""
        if src_master != "ALL": where_src += " AND o.source LIKE 'ilrdf%'" if src_master == "ILRDF" else " AND o.source NOT LIKE 'ilrdf%'"
        if src_sub != "ALL": where_src += f" AND o.source = '{src_sub}'"

        placeholders = ",".join(["?"] * len(sel_glids))
        query = f"""
            SELECT s.zh, s.ab, o.dialect_name, s.glid
            FROM sentences s
            JOIN occurrences o ON s.id = o.sentence_id
            WHERE (s.zh LIKE ? OR s.ab LIKE ?) AND s.glid IN ({placeholders}) {where_src}
            LIMIT 2500
        """
        cur.execute(query, [f"%{q}%", f"%{q}%"] + sel_glids)
        pivot = defaultdict(dict)
        for zh, ab, d_name, glid in cur.fetchall():
            for target_dia in sel:
                if d_name == target_dia: pivot[zh][target_dia] = ab
                elif d_name == self.glid_names[glid] and target_dia not in pivot[zh]:
                    if self.dialect_to_glid[target_dia] == glid: pivot[zh][target_dia] = ab
        
        full_only = self.show_full_only.get()
        for zh, d_map in pivot.items():
            if full_only and len(d_map) < len(sel): continue
            row = [zh]
            for d in sel: row.append(d_map.get(d, ""))
            self.s_tree.insert("", tk.END, values=row)
        conn.close()

    def refresh_vs2(self):
        if self.is_loading: return
        lvl, les = self.lvl_spin.get(), self.les_spin.get()
        sel = sorted(list(self.selected_dialects))
        self.v_tree["columns"] = ["zh"] + sel
        self.v_tree.heading("zh", text="SYLLABUS MEANING"); self.v_tree.column("zh", width=350)
        for d in sel: self.v_tree.heading(d, text=d); self.v_tree.column(d, width=280)
        self.v_tree.delete(*self.v_tree.get_children())
        
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        sel_glids = list(set(self.dialect_to_glid[d] for d in sel))
        if not sel_glids: return
        
        placeholders = ",".join(["?"] * len(sel_glids))
        query = f"""
            SELECT s.zh, s.ab, o.dialect_name, s.glid
            FROM sentences s
            JOIN occurrences o ON s.id = o.sentence_id
            WHERE o.level = ? AND (o.category LIKE ? OR o.category LIKE ?)
            AND s.glid IN ({placeholders})
        """
        cur.execute(query, [str(lvl), f"%lesson {les}%", f"%class {les}%"] + sel_glids)
        pivot = defaultdict(lambda: defaultdict(list))
        for zh, ab, d_name, glid in cur.fetchall():
            for target_dia in sel:
                if d_name == target_dia:
                    if ab not in pivot[zh][target_dia]: pivot[zh][target_dia].append(ab)
                elif d_name == self.glid_names[glid]:
                    if target_dia not in pivot[zh] and self.dialect_to_glid[target_dia] == glid:
                        if ab not in pivot[zh][target_dia]: pivot[zh][target_dia].append(ab)
        
        for zh, d_map in pivot.items():
            row = [zh]
            for d in sel: row.append(" / ".join(d_map.get(d, [])))
            self.v_tree.insert("", tk.END, values=row)
        conn.close()

    def on_double_click(self, event, tree):
        region = tree.identify_region(event.x, event.y)
        if region != "cell": return
        cid = tree.identify_column(event.x)
        idx = int(cid.replace("#", "")) - 1
        if idx <= 0: return 
        val = tree.item(tree.identify_row(event.y), "values")
        zh = val[0]; ab_combined = val[idx]
        if not ab_combined: return
        primary_ab = ab_combined.split(" / ")[0]
        sel_sorted = sorted(list(self.selected_dialects))
        target_dia = sel_sorted[idx - 1]
        glid = self.dialect_to_glid[target_dia]
        g_name = self.glid_names[glid]
        
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        query = """
            SELECT o.audio_url, o.source, o.category, o.level
            FROM occurrences o
            JOIN sentences s ON o.sentence_id = s.id
            WHERE s.zh = ? AND s.ab = ? AND (o.dialect_name = ? OR o.dialect_name = ?)
            LIMIT 1
        """
        cur.execute(query, (zh, primary_ab, target_dia, g_name))
        res = cur.fetchone()
        if res:
            audio, src, cat, lvl = res
            self.audio_info.configure(text=f"PLAYING: {os.path.basename(audio)} | SRC: {src} | UNIT: {cat} (L{lvl})", fg="#00ff88")
            if audio: self.play_audio(audio)
        conn.close()

    def on_canvas_configure(self, event):
        if hasattr(self, 'canvas_window'):
            self.canvas.itemconfig(self.canvas_window, width=event.width)

    def play_audio(self, url):
        cmd = f"$p = New-Object -ComObject WMPlayer.OCX; $p.URL = '{url}'; $p.controls.play(); while($p.playState -ne 1){{Start-Sleep -m 100}}"
        subprocess.Popen(["powershell", "-WindowStyle", "Hidden", "-Command", cmd])

if __name__ == "__main__":
    db = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "export", "games_master.db"))
    if os.path.exists(db):
        app = KlokahMasterApp(db)
        app.mainloop()
    else:
        print(f"DATABASE NOT FOUND: {db}")
