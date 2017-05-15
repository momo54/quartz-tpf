# Utilities for plotting
# Author: Thomas Minier
using DataFramesMeta
# Themes
panel_theme = Theme(
  key_position = :top,
  bar_spacing = 0.2px
)

no_colors_guide = Theme(
  key_position = :none
)

function clean(df, list)
  return where(groupby(df, [:query]), d -> ! (d[1, :query] in list))
end

# Custom color scale for plots
function colors()
 return Scale.color_discrete_manual(colorant"#990000", colorant"#ff4000", colorant"#ffbf00")
end

# Concat results from three distinct runs
function concatRuns(run1, run2, run3)
  return hcat(run1, run2, run3)
end

# Compute the mean of three runs
function meanRun(runs)
  res = DataFrame(mean_value = [])
  for row in eachrow(runs)
    push!(res, [ mean(convert(Array, row)) ])
  end
  return res
end

function qNumbers(nb)
  return map(x -> "Q$x", 1:nb)
end
