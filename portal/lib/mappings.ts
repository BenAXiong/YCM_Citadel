
/**
 * Master mapping for resolving generic dialect names to specific sub-dialects.
 * Format: { [source_plus_category_or_dialect_name]: target_sub_dialect }
 */
export const GENERIC_MAPPINGS: Record<string, string> = {
    // 族語短文 (Essays) often have generic family names. 
    // We attribute some to the "standard" or most common sub-dialect for that source.
    "太魯閣語 族語短文": "太魯閣語",
    "噶瑪蘭語 族語短文": "噶瑪蘭語",
    "鄒語 族語短文": "鄒語",
    "撒奇萊雅語 族語短文": "撒奇萊雅語",
    "南王卑南語 族語短文": "南王卑南語",
    "知本卑南語 族語短文": "知本卑南語",
    "初鹿卑南語 族語短文": "知本卑南語",
    "建和卑南語 族語短文": "建和卑南語",
    "雅美語 族語短文": "雅美語",
    "邵語 族語短文": "邵語",
    "賽夏語 族語短文": "賽夏語",
    "萬山魯凱語 族語短文": "萬山魯凱語",
    "茂林魯凱語 族語短文": "茂林魯凱語",
    "多納魯凱語 族語短文": "多納魯凱語",
    "阿美語": "馬蘭阿美語",
    "泰雅語": "賽考利克泰雅語",
    "排灣語": "北排灣語",
    "布農語": "郡群布農語",
    "卑南語": "南王卑南語",
    "魯凱語": "霧台魯凱語",
    "賽德克語": "德固達雅賽德克語",
};

/**
 * Sources where we can safely infer a specific dialect even if the label is generic.
 */
export const SOURCE_INFERENCES: Record<string, Record<string, string>> = {
    "nine_year": {
        "01": "南勢阿美語", // Just an example, ideally this uses a more complex lookup
    }
};
