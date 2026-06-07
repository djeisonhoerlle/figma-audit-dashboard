## Metrics

### Design System Coverage

Measures how much of the analyzed content is connected to Design System assets.

```text
Design System Coverage = (Styles + Variables) / Total Solid Fills
```

A coverage score of 100% indicates that every analyzed asset is connected to the Design System through either Styles or Variables.

Coverage measures connectivity, regardless of whether the asset is using legacy or modern Design System technologies.

### Variable Adoption

Measures migration progress from legacy Styles to Variables.

```text
Variable Adoption = Variables / Total Solid Fills
```

This metric helps teams evaluate modernization efforts and monitor migration progress.

### Design System Maturity Score

Measures the quality of Design System adoption by assigning different weights to each implementation approach.

```text
Hardcoded Values = 0
Styles = 70
Variables = 100
```

The final score is calculated using a weighted average across all analyzed assets.

This approach distinguishes Design System connectivity from Design System maturity, allowing teams to understand not only whether assets are connected to the system, but also how modern and maintainable that adoption is.
