using Gadfly
using DataFramesMeta
using RDatasets

include("utils.jl")

Gadfly.push_theme(no_colors_guide)

# blacklist = [1, 3, 6, 7, 14, 15, 16, 18, 19, 27, 28, 32, 33, 36, 40, 41, 42, 44, 53, 56, 57, 61, 67, 68, 69, 74, 75, 80, 86, 90, 94]
blacklist = []
#
# function clean(df)
#   return where(groupby(df, [:query]), d -> ! (d[1, :query] in blacklist))
# end
#
# function processData(df)
#   return DataFrame(clean(df))
# end

calls_ref = processData(readtable("amazon/load/http_calls_ref.csv"), blacklist)
calls_ref[:approach] = "TPF"

calls_quartz_eq = processData(readtable("amazon/load/eq/http_calls_quartz_eq2.csv"), blacklist)
calls_peneloop_eq = processData(readtable("amazon/load/eq/http_calls_peneloop_eq.csv"), blacklist)
calls_all_eq = processData(readtable("amazon/load/eq/http_calls_all_eq.csv"), blacklist)
calls_truc = processData(readtable("amazon/load/eq/http_calls.csv"), blacklist)

calls_quartz_eq[:approach] = "TQ"
calls_peneloop_eq[:approach] = "TP"
calls_all_eq[:approach] = "TPQ-EQ"
calls_truc[:approach] = "truc"

calls_quartz_neq = processData(readtable("amazon/load/neq/http_calls_quartz_neq2.csv"), blacklist)
calls_peneloop_neq = processData(readtable("amazon/load/neq/http_calls_peneloop_neq.csv"), blacklist)
calls_all_neq = processData(readtable("amazon/load/neq/http_calls_all_neq.csv"), blacklist)

calls_quartz_neq[:approach] = "TQ"
calls_peneloop_neq[:approach] = "TP"
calls_all_neq[:approach] = "TPQ-NEQ"

calls_eq = [calls_peneloop_eq;calls_quartz_eq;calls_all_eq;calls_truc]
calls_neq = [calls_peneloop_neq;calls_quartz_neq;calls_all_neq]

# plot_eq = plot(calls_eq, xgroup=:approach, x=:server, y=:calls, color=:approach, Geom.subplot_grid(Geom.boxplot), Guide.xlabel(""), Guide.ylabel("Number of HTTP calls", orientation=:vertical), Guide.colorkey(""), Scale.x_discrete, colors())
# plot_neq = plot(calls_neq, xgroup=:approach, x=:server, y=:calls, color=:approach, Geom.subplot_grid(Geom.boxplot), Guide.xlabel(""), Guide.ylabel(""), Guide.colorkey(""), Scale.x_discrete, colors())
# # draw(PDF("amazon/http_calls.pdf", 7inch, 3.5inch), plot_eq)
# draw(PDF("amazon/http_calls_eq.pdf", 5inch, 3inch), plot_eq)
# draw(PDF("amazon/http_calls_neq.pdf", 3.5inch, 3inch), plot_neq)
# draw(PNG("amazon/http_calls_eq.png", 3.5inch, 3inch), plot_eq)
# draw(PNG("amazon/http_calls_neq.png", 3.5inch, 3inch), plot_neq)
