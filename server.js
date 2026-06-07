require("dotenv").config();
const express = require("express");
const { audit } = require("./audit");

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/api/audit", async (req, res) => {

  console.log("REQ CHEGOU");

  try {
    const { fileKey } = req.body;

    if (!fileKey) {
      return res.status(400).json({ error: "fileKey obrigatório" });
    }

    const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

    if (!FIGMA_TOKEN) {
      return res.status(500).json({ error: "FIGMA_TOKEN não definido" });
    }

    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        "X-Figma-Token": FIGMA_TOKEN
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: "Erro ao consultar Figma",
        details: text
      });
    }

    const data = await response.json();

    const resultado = audit(data);

    // ============================
    // 🔥 AGREGAÇÃO GLOBAL
    // ============================

    let total = 0;
    let totalStyles = 0;
    let totalVariables = 0;
    let totalHardcoded = 0;

    Object.values(resultado.metricas).forEach(m => {
      total += m.total;
      totalStyles += m.styles;
      totalVariables += m.variables;
      totalHardcoded += m.hardcoded;
    });

    // ============================
    // 🔥 SCORE PONDERADO
    // ============================

    const pesoVariable = 1;
    const pesoStyle = 0.7;
    const pesoHardcoded = 0;

    const scoreBruto =
      (totalVariables * pesoVariable +
        totalStyles * pesoStyle +
        totalHardcoded * pesoHardcoded) / (total || 1);

    const score = Math.round(scoreBruto * 100);

    // ============================
    // 🔥 MÉTRICAS GLOBAIS
    // ============================

    const percentStyles = total ? totalStyles / total : 0;
    const percentVariables = total ? totalVariables / total : 0;
    const percentCobertura = total
      ? (totalStyles + totalVariables) / total
      : 0;

    // ============================
    // 🔥 COMPONENTES ENRIQUECIDOS
    // ============================

    const componentes = Array.from(resultado.todosComponentes).map(nome => {
      const m = resultado.metricas[nome] || {
        total: 0,
        styles: 0,
        variables: 0,
        hardcoded: 0,
        percentStyles: 0,
        percentVariables: 0,
        percentCobertura: 0
      };

      const violacoes = resultado.violacoes[nome]
        ? resultado.violacoes[nome].size
        : 0;

      // score individual
      const scoreCompBruto =
        (m.variables * pesoVariable +
          m.styles * pesoStyle +
          m.hardcoded * pesoHardcoded) / (m.total || 1);

      const scoreComponente = Math.round(scoreCompBruto * 100);

      return {
        nome,
        violacoes,
        total: m.total,
        percentStyles: m.percentStyles,
        percentVariables: m.percentVariables,
        percentCobertura: m.percentCobertura,
        score: scoreComponente
      };
    });

    // ============================
    // 🔥 RESPOSTA FINAL
    // ============================

    res.json({
      score,
      metricasGlobais: {
        percentStyles,
        percentVariables,
        percentCobertura
      },
      componentes,
      metricas: resultado.metricas // mantém bruto também
    });

  } catch (err) {
    res.status(500).json({
      error: "Erro interno",
      details: err.message
    });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});