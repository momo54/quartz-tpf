using Gadfly
using RDatasets

# Themes
panel_theme = Theme(
  key_position = :top,
  bar_spacing = 0.2px
)

no_colors_guide = Theme(
  key_position = :none
)

Gadfly.push_theme(no_colors_guide)

# Custom color scale for plots
function colors()
 return Scale.color_discrete_manual(colorant"#990000", colorant"#ff4000", colorant"#ffbf00")
end

function computeSum(data)
  server1 = sum(data[data[:server] .== 1,:][:calls])
  server2 = sum(data[data[:server] .== 2,:][:calls])
  return DataFrame(server = [ 1, 2 ], sum = [ server1, server2 ])
end

calls_ref = computeSum(readtable("amazon/load/http_calls_ref.csv"))

calls_quartz_eq = computeSum(readtable("amazon/load/eq/http_calls_quartz_eq.csv"))
calls_peneloop_eq = computeSum(readtable("amazon/load/eq/http_calls_peneloop_eq.csv"))
calls_all_eq = computeSum(readtable("amazon/load/eq/http_calls_all_eq.csv"))

calls_ref[:approach] = "TPF"
calls_quartz_eq[:approach] = "TPF+Q-EQ"
calls_peneloop_eq[:approach] = "TPF+P-EQ"
calls_all_eq[:approach] = "TPF+P+Q-EQ"

calls_eq = [calls_ref;calls_peneloop_eq;calls_quartz_eq;calls_all_eq]

plot_eq = plot(calls_eq, xgroup=:approach, x=:server, y=:sum, color=:approach, Geom.subplot_grid(Geom.bar), Guide.xlabel("Server"), Guide.ylabel("Execution time (s)", orientation=:vertical), Guide.colorkey(""), Scale.x_discrete, colors())

draw(PDF("amazon/http_calls_eq.pdf", 7inch, 4inch), plot_eq)
