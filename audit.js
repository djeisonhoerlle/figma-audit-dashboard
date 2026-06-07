function audit(data) {
  const violacoes = {};
  const todosComponentes = new Set();

  const metricas = {};

  function scan(node, componente) {
    if (!node) return;

    // inicializa métricas do componente
    if (!metricas[componente]) {
      metricas[componente] = {
        total: 0,
        styles: 0,
        variables: 0,
        hardcoded: 0
      };
    }

    const temVariable =
      node.boundVariables && Object.keys(node.boundVariables).length > 0;

    const temStyle = !!(node.styles && node.styles.fill);

    if (node.fills) {
      node.fills.forEach(fill => {
        if (fill.type !== "SOLID") return;

        metricas[componente].total++;

        if (temStyle) {
          metricas[componente].styles++;
        } else if (temVariable) {
          metricas[componente].variables++;
        } else {
          metricas[componente].hardcoded++;

          const r = Math.round(fill.color.r * 255);
          const g = Math.round(fill.color.g * 255);
          const b = Math.round(fill.color.b * 255);

          const hex =
            "#" +
            [r, g, b]
              .map(x => x.toString(16).padStart(2, "0"))
              .join("");

          if (!violacoes[componente]) {
            violacoes[componente] = new Set();
          }

          violacoes[componente].add(hex);
        }
      });
    }

    if (node.children) {
      node.children.forEach(child => scan(child, componente));
    }
  }

  data.document.children.forEach(page => {
    const componente = page.name;

    todosComponentes.add(componente);

    page.children.forEach(node => {
      scan(node, componente);
    });
  });

  // 🔥 NOVO: calcular métricas derivadas (%)
  Object.keys(metricas).forEach(comp => {
    const m = metricas[comp];

    if (m.total === 0) {
      m.percentStyles = 0;
      m.percentVariables = 0;
      m.percentCobertura = 0;
    } else {
      m.percentStyles = m.styles / m.total;
      m.percentVariables = m.variables / m.total;
      m.percentCobertura = (m.styles + m.variables) / m.total;
    }
  });

  return {
    violacoes,
    todosComponentes,
    metricas
  };
}

module.exports = { audit };