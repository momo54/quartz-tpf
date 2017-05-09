using Gadfly
using DataFramesMeta
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

blacklist = [3, 6, 7, 14, 15, 16, 18, 19, 27, 28, 32, 33, 36, 40, 41, 42, 44, 53, 56, 57, 61, 67, 68, 69, 74, 75, 80, 86, 90, 94]

# Custom color scale for plots
function colors()
 return Scale.color_discrete_manual(colorant"#990000", colorant"#ff4000", colorant"#ffbf00")
end

function clean(df)
  return where(groupby(df, [:query]), d -> ! (d[1, :query] in blacklist))
end

function computeDiff(groupedDf)
  res = DataFrame(query = [], diff = [], server = [])
  for df in groupedDf
    sum = df[1, :calls] + df[2, :calls]
    push!(res, [ df[1, :query], (df[1, :calls] / sum), df[1, :server] ])
    push!(res, [ df[2, :query], (df[2, :calls] / sum), df[2, :server] ])
  end
  return res
end

function processData(df)
  return DataFrame(clean(df))
end

# function computeSum(df)
#   data = clean(df)
#   server1 = sum(data[data[:server] .== 1,:][:calls])
#   server2 = sum(data[data[:server] .== 2,:][:calls])
#   return DataFrame(server = [ 1, 2 ], sum = [ server1, server2 ])
# end

calls_ref = processData(readtable("amazon/load/http_calls_ref.csv"))

calls_quartz_eq = processData(readtable("amazon/load/eq/http_calls_quartz_eq.csv"))
calls_peneloop_eq = processData(readtable("amazon/load/eq/http_calls_peneloop_eq.csv"))
calls_all_eq = processData(readtable("amazon/load/eq/http_calls_all_eq.csv"))

calls_ref[:approach] = "TPF"
calls_quartz_eq[:approach] = "TPF+Q-EQ"
calls_peneloop_eq[:approach] = "TPF+P-EQ"
calls_all_eq[:approach] = "TPF+P+Q-EQ"

calls_eq = [calls_ref;calls_peneloop_eq;calls_quartz_eq;calls_all_eq]

# plot_eq = plot(calls_eq, xgroup=:approach, x=:server, y=:calls, color=:approach, Geom.subplot_grid(Geom.boxplot), Guide.xlabel("Server"), Guide.ylabel("Execution time (s)", orientation=:vertical), Guide.colorkey(""), Scale.x_discrete, colors())
plot_eq = plot(calls_all_eq, x=:query, y=:calls, color=:server, Geom.bar(position=:dodge,orientation=:vertical), Guide.xlabel("Queries"), Guide.ylabel("Execution time (s)", orientation=:vertical), Guide.colorkey(""), Scale.x_continuous, colors())

draw(PDF("amazon/http_calls_eq.pdf", 7inch, 4inch), plot_eq)
