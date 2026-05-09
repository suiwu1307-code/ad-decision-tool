import { useState } from "react";

const COLORS = {
  primary: "#4F46E5",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  bg: "#F8F7FF",
  card: "#FFFFFF",
};

function Tag({ color, children }) {
  const map = {
    green: { bg: "#D1FAE5", text: "#065F46" },
    yellow: { bg: "#FEF3C7", text: "#92400E" },
    red: { bg: "#FEE2E2", text: "#991B1B" },
    blue: { bg: "#E0E7FF", text: "#3730A3" },
    purple: { bg: "#EDE9FE", text: "#5B21B6" },
  };
  const s = map[color] || map.blue;
  return (
    <span style={{ background: s.bg, color: s.text, borderRadius: 20, padding: "3px 12px", fontSize: 13, fontWeight: 700, display: "inline-block" }}>
      {children}
    </span>
  );
}

function Meter({ value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ background: "#F3F4F6", borderRadius: 8, height: 8, overflow: "hidden" }}>
      <div style={{ width: pct + "%", height: "100%", background: color, borderRadius: 8, transition: "width 0.6s" }} />
    </div>
  );
}

function InputRow({ label, hint, value, onChange, prefix, suffix, placeholder }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{label}</label>
        {hint && <span style={{ fontSize: 12, color: "#9CA3AF" }}>{hint}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #E5E7EB", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
        {prefix && <span style={{ padding: "0 12px", color: "#9CA3AF", fontSize: 14, borderRight: "1px solid #E5E7EB", background: "#F9FAFB" }}>{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={function(e) { onChange(e.target.value); }}
          placeholder={placeholder}
          style={{ flex: 1, border: "none", outline: "none", padding: "10px 12px", fontSize: 15, color: "#111827", background: "transparent" }}
        />
        {suffix && <span style={{ padding: "0 12px", color: "#9CA3AF", fontSize: 14, borderLeft: "1px solid #E5E7EB", background: "#F9FAFB" }}>{suffix}</span>}
      </div>
    </div>
  );
}

function analyze(inputs) {
  const { acos, targetAcos, cvr, exposure, budget } = inputs;
  const acosDiff = acos - targetAcos;
  const acosRatio = acos / targetAcos;

  // 广告类型判断
  let adType, adTypeColor, adTypeDesc;
  if (acos <= targetAcos * 0.85) {
    adType = "💰 利润型"; adTypeColor = "green";
    adTypeDesc = "ACoS 远低于目标，广告高效盈利中。";
  } else if (acos <= targetAcos * 1.1) {
    adType = "⚖️ 保本型"; adTypeColor = "yellow";
    adTypeDesc = "ACoS 接近目标，广告处于盈亏平衡区间。";
  } else {
    adType = "🚀 投资型"; adTypeColor = "red";
    adTypeDesc = "ACoS 高于目标，当前以投资扩量为主，需关注转化表现。";
  }

  // CVR 评估
  let cvrLevel, cvrColor;
  if (cvr >= 15) { cvrLevel = "优秀"; cvrColor = "green"; }
  else if (cvr >= 8) { cvrLevel = "正常"; cvrColor = "yellow"; }
  else { cvrLevel = "偏低"; cvrColor = "red"; }

  // 曝光量评估
  let expLevel, expColor;
  if (exposure >= 50000) { expLevel = "充足"; expColor = "green"; }
  else if (exposure >= 10000) { expLevel = "一般"; expColor = "yellow"; }
  else { expLevel = "不足"; expColor = "red"; }

  // 预算建议
  let action, actionColor, adjustPct, reasons = [];

  if (acos <= targetAcos * 0.85 && cvr >= 8 && exposure < 50000) {
    action = "📈 建议加预算"; actionColor = COLORS.success; adjustPct = 30;
    reasons = ["ACoS 表现优秀，有利润空间", "CVR 良好，转化有保障", "曝光不足，加预算可放大规模"];
  } else if (acos <= targetAcos * 0.85 && cvr >= 8 && exposure >= 50000) {
    action = "📈 建议小幅加预算"; actionColor = COLORS.success; adjustPct = 15;
    reasons = ["ACoS 低于目标，效率高", "曝光已充足，小幅加量即可", "注意观察加量后 ACoS 变化"];
  } else if (acosRatio <= 1.1 && cvr >= 8) {
    action = "✅ 建议维持预算"; actionColor = COLORS.primary; adjustPct = 0;
    reasons = ["ACoS 处于目标区间", "CVR 表现正常", "当前状态稳定，观察为主"];
  } else if (acos > targetAcos * 1.3 && cvr < 8) {
    action = "📉 建议减预算"; actionColor = COLORS.danger; adjustPct = -25;
    reasons = ["ACoS 严重超标", "CVR 偏低，点击未能有效转化", "建议降预算同时检查 Listing 和关键词匹配"];
  } else if (acos > targetAcos * 1.1 && cvr >= 8) {
    action = "⚠️ 建议小幅减预算"; actionColor = COLORS.warning; adjustPct = -15;
    reasons = ["ACoS 高于目标但 CVR 尚可", "适当收紧预算，等待数据积累", "可优化出价或暂停低效词"];
  } else {
    action = "✅ 建议维持预算"; actionColor = COLORS.primary; adjustPct = 0;
    reasons = ["指标处于观察区间", "数据量可能不足，建议继续积累", "保持当前预算，下周再评估"];
  }

  const newBudget = adjustPct !== 0 ? (budget * (1 + adjustPct / 100)).toFixed(2) : null;

  // 健康度评分
  let score = 100;
  if (acosRatio > 1.3) score -= 35;
  else if (acosRatio > 1.1) score -= 20;
  else if (acosRatio < 0.85) score += 5;
  if (cvr < 8) score -= 25;
  else if (cvr >= 15) score += 5;
  if (exposure < 10000) score -= 15;
  else if (exposure < 50000) score -= 5;
  score = Math.max(0, Math.min(100, score));

  let scoreColor = score >= 75 ? COLORS.success : score >= 50 ? COLORS.warning : COLORS.danger;
  let scoreLabel = score >= 75 ? "健康" : score >= 50 ? "需关注" : "警告";

  return { adType, adTypeColor, adTypeDesc, cvrLevel, cvrColor, expLevel, expColor, action, actionColor, adjustPct, newBudget, reasons, score, scoreColor, scoreLabel };
}

export default function App() {
  const [acos, setAcos] = useState("");
  const [targetAcos, setTargetAcos] = useState("");
  const [cvr, setCvr] = useState("");
  const [exposure, setExposure] = useState("");
  const [budget, setBudget] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiComment, setAiComment] = useState("");

  const canSubmit = acos && targetAcos && cvr && exposure && budget;

  const handleAnalyze = async function() {
    if (!canSubmit) return;
    setLoading(true);
    setResult(null);
    setAiComment("");
    const inputs = {
      acos: parseFloat(acos),
      targetAcos: parseFloat(targetAcos),
      cvr: parseFloat(cvr),
      exposure: parseFloat(exposure),
      budget: parseFloat(budget),
    };
    const r = analyze(inputs);
    setResult(r);

    try {
      const prompt = "你是一位亚马逊广告优化专家。根据以下广告数据，用2-3句中文给出简洁专业的操盘建议，语气像资深运营在给同事说话，不要废话，直接说重点。\n" +
        "实际ACoS: " + inputs.acos + "%，目标ACoS: " + inputs.targetAcos + "%\n" +
        "转化率CVR: " + inputs.cvr + "%\n" +
        "曝光量: " + inputs.exposure + "\n" +
        "当前日预算: $" + inputs.budget + "\n" +
        "系统判断: " + r.action + "，广告类型: " + r.adType + "\n" +
        "直接输出建议内容，不要任何前缀或标题。";
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      setAiComment(data.content && data.content[0] ? data.content[0].text : "");
    } catch(e) {
      setAiComment("建议结合实际情况综合判断。");
    }
    setLoading(false);
  };

  const handleReset = function() {
    setAcos(""); setTargetAcos(""); setCvr(""); setExposure(""); setBudget("");
    setResult(null); setAiComment("");
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "24px 16px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📊</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1F2937", margin: "0 0 6px" }}>广告投放决策助手</h1>
          <p style={{ color: "#6B7280", fontSize: 14, margin: 0 }}>输入广告数据，获取预算调整建议</p>
        </div>

        {/* 输入卡片 */}
        <div style={{ background: COLORS.card, borderRadius: 20, padding: "28px 24px", marginBottom: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#374151", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #F3F4F6" }}>📥 输入广告数据</h2>
          <InputRow label="实际 ACoS" hint="广告销售成本比" value={acos} onChange={setAcos} suffix="%" placeholder="例如 35" />
          <InputRow label="目标 ACoS" hint="你设定的理想值" value={targetAcos} onChange={setTargetAcos} suffix="%" placeholder="例如 25" />
          <InputRow label="转化率 CVR" hint="点击转订单比例" value={cvr} onChange={setCvr} suffix="%" placeholder="例如 12" />
          <InputRow label="曝光量" hint="统计周期内总曝光" value={exposure} onChange={setExposure} placeholder="例如 30000" />
          <InputRow label="当前日预算" value={budget} onChange={setBudget} prefix="$" placeholder="例如 50" />

          <button
            onClick={handleAnalyze}
            disabled={!canSubmit || loading}
            style={{
              width: "100%", marginTop: 8,
              background: canSubmit ? "linear-gradient(135deg, #4F46E5, #7C3AED)" : "#E5E7EB",
              color: canSubmit ? "white" : "#9CA3AF",
              border: "none", borderRadius: 50, padding: "13px",
              fontSize: 15, fontWeight: 700, cursor: canSubmit ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
          >
            {loading ? "分析中..." : "开始分析 →"}
          </button>
        </div>

        {/* 结果 */}
        {result && (
          <>
            {/* 主建议 */}
            <div style={{ background: COLORS.card, borderRadius: 20, padding: "24px", marginBottom: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", borderLeft: "4px solid " + result.actionColor }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: result.actionColor, marginBottom: 12 }}>{result.action}</div>
              {result.adjustPct !== 0 && (
                <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                  <div style={{ background: "#F9FAFB", borderRadius: 12, padding: "10px 16px", flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 2 }}>调整幅度</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: result.adjustPct > 0 ? COLORS.success : COLORS.danger }}>
                      {result.adjustPct > 0 ? "+" : ""}{result.adjustPct}%
                    </div>
                  </div>
                  <div style={{ background: "#F9FAFB", borderRadius: 12, padding: "10px 16px", flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 2 }}>建议新预算</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#1F2937" }}>${result.newBudget}/天</div>
                  </div>
                </div>
              )}
              <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>决策依据：</div>
              {result.reasons.map(function(r, i) {
                return <div key={i} style={{ fontSize: 13, color: "#374151", marginBottom: 6, display: "flex", gap: 8 }}><span style={{ color: COLORS.primary }}>•</span>{r}</div>;
              })}
            </div>

            {/* 广告类型 + 健康度 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div style={{ background: COLORS.card, borderRadius: 16, padding: "18px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 8 }}>广告类型</div>
                <Tag color={result.adTypeColor}>{result.adType}</Tag>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 10, lineHeight: 1.5 }}>{result.adTypeDesc}</div>
              </div>
              <div style={{ background: COLORS.card, borderRadius: 16, padding: "18px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 8 }}>广告健康度</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: result.scoreColor, marginBottom: 8 }}>{result.score}</div>
                <Meter value={result.score} max={100} color={result.scoreColor} />
                <div style={{ fontSize: 12, color: result.scoreColor, marginTop: 6, fontWeight: 600 }}>{result.scoreLabel}</div>
              </div>
            </div>

            {/* 指标评估 */}
            <div style={{ background: COLORS.card, borderRadius: 16, padding: "20px 24px", marginBottom: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 16 }}>📋 指标评估</div>
              {[
                { label: "ACoS", value: acos + "% / 目标 " + targetAcos + "%", tag: parseFloat(acos) <= parseFloat(targetAcos) * 0.85 ? "green" : parseFloat(acos) <= parseFloat(targetAcos) * 1.1 ? "yellow" : "red", tagLabel: parseFloat(acos) <= parseFloat(targetAcos) * 0.85 ? "优秀" : parseFloat(acos) <= parseFloat(targetAcos) * 1.1 ? "达标" : "超标" },
                { label: "转化率 CVR", value: cvr + "%", tag: result.cvrColor, tagLabel: result.cvrLevel },
                { label: "曝光量", value: parseInt(exposure).toLocaleString(), tag: result.expColor, tagLabel: result.expLevel },
              ].map(function(item, i) {
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, marginBottom: 12, borderBottom: i < 2 ? "1px solid #F9FAFB" : "none" }}>
                    <div>
                      <div style={{ fontSize: 13, color: "#6B7280" }}>{item.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#1F2937", marginTop: 2 }}>{item.value}</div>
                    </div>
                    <Tag color={item.tag}>{item.tagLabel}</Tag>
                  </div>
                );
              })}
            </div>

            {/* AI点评 */}
            <div style={{ background: "linear-gradient(135deg, #EEF2FF, #F5F3FF)", border: "1px solid #C7D2FE", borderRadius: 16, padding: "18px 20px", marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: COLORS.primary, fontWeight: 700, marginBottom: 8 }}>🤖 AI 专家点评</div>
              {aiComment
                ? <p style={{ color: "#374151", fontSize: 14, lineHeight: 1.8, margin: 0 }}>{aiComment}</p>
                : <p style={{ color: "#9CA3AF", fontSize: 13, margin: 0 }}>生成中...</p>
              }
            </div>

            <button onClick={handleReset} style={{ width: "100%", background: "white", color: COLORS.primary, border: "2px solid #E0E7FF", borderRadius: 50, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              重新分析 🔄
            </button>
          </>
        )}
      </div>
    </div>
  );
}
