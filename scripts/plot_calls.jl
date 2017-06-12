using Gadfly
using DataFramesMeta
using RDatasets

include("utils.jl")

no_colors_guide2 = Theme(
  key_position = :none,
  bar_spacing = 10px,
)

Gadfly.push_theme(no_colors_guide2)

blacklist = [1, 3, 6, 7, 14, 15, 16, 18, 19, 27, 28, 32, 33, 36, 40, 41, 42, 44, 53, 56, 57, 61, 67, 68, 69, 74, 75, 80, 86, 90, 94]
# blacklist = [91, 92]
#
# function clean(df)
#   return where(groupby(df, [:query]), d -> ! (d[1, :query] in blacklist))
# end

function processData(df, list)
  return DataFrame(clean(df, list))
end

calls_ref = processData(readtable("amazon/load/http_calls_ref.csv"), blacklist)
calls_ref[:approach] = "TPF"

calls_quartz_eq = processData(readtable("amazon/load/eq/http_calls_quartz_eq2.csv"), blacklist)
calls_peneloop_eq = processData(readtable("amazon/load/eq/http_calls_pen2_eq.csv"), blacklist)
calls_all_eq = processData(readtable("amazon/load/eq/http_calls_all2_eq.csv"), blacklist)

sum_quartz_eq = DataFrame(sum = [ sum(calls_quartz_eq[calls_quartz_eq[:server] .== "E1", :][:calls]), sum(calls_quartz_eq[calls_quartz_eq[:server] .== "E2", :][:calls]) ], server = [ "E1", "E2" ], approach = [ "TQ", "TQ"])
sum_pen_eq = DataFrame(sum = [ sum(calls_peneloop_eq[calls_peneloop_eq[:server] .== "E1", :][:calls]), sum(calls_peneloop_eq[calls_peneloop_eq[:server] .== "E2", :][:calls]) ], server = [ "E1", "E2" ], approach = [ "TP", "TP"])
sum_all_eq = DataFrame(sum = [ sum(calls_all_eq[calls_all_eq[:server] .== "E1", :][:calls]), sum(calls_all_eq[calls_all_eq[:server] .== "E2", :][:calls]) ], server = [ "E1", "E2" ], approach = [ "TQP", "TQP"])

sum_quartz_eq[:labels] = [ string(sum_quartz_eq[1, :sum]), string(sum_quartz_eq[2, :sum]) ]
sum_pen_eq[:labels] = [ string(sum_pen_eq[1, :sum]), string(sum_pen_eq[2, :sum]) ]
sum_all_eq[:labels] = [ string(sum_all_eq[1, :sum]), string(sum_all_eq[2, :sum]) ]

# calls_quartz_eq[:approach] = "TQ"
# calls_peneloop_eq[:approach] = "TP"
# calls_all_eq[:approach] = "TQP"
#
calls_quartz_neq = processData(readtable("amazon/load/neq/http_calls_quartz_neq2.csv"), blacklist)
calls_peneloop_neq = processData(readtable("amazon/load/neq/http_calls_pen2_neq.csv"), blacklist)
calls_all_neq = processData(readtable("amazon/load/neq/http_calls_all2_neq.csv"), blacklist)

sum_quartz_neq = DataFrame(sum = [ sum(calls_quartz_neq[calls_quartz_neq[:server] .== "E1", :][:calls]), sum(calls_quartz_neq[calls_quartz_neq[:server] .== "E2", :][:calls]) ], server = [ "E1", "E2" ], approach = [ "TQ", "TQ"])
sum_pen_neq = DataFrame(sum = [ sum(calls_peneloop_neq[calls_peneloop_neq[:server] .== "E1", :][:calls]), sum(calls_peneloop_neq[calls_peneloop_neq[:server] .== "E2", :][:calls]) ], server = [ "E1", "E2" ], approach = [ "TP", "TP"])
sum_all_neq = DataFrame(sum = [ sum(calls_all_neq[calls_all_neq[:server] .== "E1", :][:calls]), sum(calls_all_neq[calls_all_neq[:server] .== "E2", :][:calls]) ], server = [ "E1", "E2" ], approach = [ "TQP", "TQP"])

sum_quartz_neq[:labels] = [ string(sum_quartz_neq[1, :sum]), string(sum_quartz_neq[2, :sum]) ]
sum_pen_neq[:labels] = [ string(sum_pen_neq[1, :sum]), string(sum_pen_neq[2, :sum]) ]
sum_all_neq[:labels] = [ string(sum_all_neq[1, :sum]), string(sum_all_neq[2, :sum]) ]

# calls_quartz_neq[:approach] = "TQ"
# calls_peneloop_neq[:approach] = "TP"
# calls_all_neq[:approach] = "TQP"
#
# calls_eq = [calls_peneloop_eq;calls_quartz_eq;calls_all_eq]
calls_eq = [sum_pen_eq;sum_quartz_eq;sum_all_eq]
calls_neq = [sum_pen_neq;sum_quartz_neq;sum_all_neq]

# calls_neq = [calls_peneloop_neq;calls_quartz_neq;calls_all_neq]
#
plot_eq = plot(calls_eq, xgroup=:approach, x=:server, y=:sum, color=:approach, label=:labels, Geom.subplot_grid(Geom.bar, Geom.label(position=:above)), Guide.xlabel(""), Guide.ylabel("Number of HTTP calls", orientation=:vertical), Guide.colorkey(""), Scale.x_discrete, colors())
plot_neq = plot(calls_neq, xgroup=:approach, x=:server, y=:sum, color=:approach, label=:labels, Geom.subplot_grid(Geom.bar, Geom.label(position=:above)), Guide.xlabel(""), Guide.ylabel(""), Guide.colorkey(""), Scale.x_discrete, colors())

Gadfly.pop_theme()

# Calls per query
calls_quartz_eq[:approach] = "TQ"
calls_peneloop_eq[:approach] = "TP"
calls_all_eq[:approach] = "TQP"

plot_calls_query_eq1 = plot([calls_quartz_eq[1:20,:];calls_peneloop_eq[1:20,:];calls_all_eq[1:20,:]], xgroup=:query, x=:server, y=:calls, color=:approach, Geom.subplot_grid(Geom.bar(position=:dodge)), Guide.xlabel(""), Guide.ylabel("Number of HTTP calls", orientation=:vertical), Guide.colorkey(""), Scale.x_discrete, colors())
plot_calls_query_eq2 = plot([calls_quartz_eq[21:40,:];calls_peneloop_eq[21:40,:];calls_all_eq[21:40,:]], xgroup=:query, x=:server, y=:calls, color=:approach, Geom.subplot_grid(Geom.bar(position=:dodge)), Guide.xlabel(""), Guide.ylabel("Number of HTTP calls", orientation=:vertical), Guide.colorkey(""), Scale.x_discrete, colors())
plot_calls_query_eq3 = plot([calls_quartz_eq[41:60,:];calls_peneloop_eq[41:60,:];calls_all_eq[41:60,:]], xgroup=:query, x=:server, y=:calls, color=:approach, Geom.subplot_grid(Geom.bar(position=:dodge)), Guide.xlabel(""), Guide.ylabel("Number of HTTP calls", orientation=:vertical), Guide.colorkey(""), Scale.x_discrete, colors())
plot_calls_query_eq4 = plot([calls_quartz_eq[61:80,:];calls_peneloop_eq[61:80,:];calls_all_eq[61:80,:]], xgroup=:query, x=:server, y=:calls, color=:approach, Geom.subplot_grid(Geom.bar(position=:dodge)), Guide.xlabel(""), Guide.ylabel("Number of HTTP calls", orientation=:vertical), Guide.colorkey(""), Scale.x_discrete, colors())
plot_calls_query_eq5 = plot([calls_quartz_eq[81:100,:];calls_peneloop_eq[81:100,:];calls_all_eq[81:100,:]], xgroup=:query, x=:server, y=:calls, color=:approach, Geom.subplot_grid(Geom.bar(position=:dodge)), Guide.xlabel(""), Guide.ylabel("Number of HTTP calls", orientation=:vertical), Guide.colorkey(""), Scale.x_discrete, colors())
plot_calls_query_eq6 = plot([calls_quartz_eq[101:113,:];calls_peneloop_eq[101:113,:];calls_all_eq[101:113,:]], xgroup=:query, x=:server, y=:calls, color=:approach, Geom.subplot_grid(Geom.bar(position=:dodge)), Guide.xlabel(""), Guide.ylabel("Number of HTTP calls", orientation=:vertical), Guide.colorkey(""), Scale.x_discrete, colors())
plot_calls_query_eq7 = plot([calls_quartz_eq[114:126,:];calls_peneloop_eq[114:126,:];calls_all_eq[114:126,:]], xgroup=:query, x=:server, y=:calls, color=:approach, Geom.subplot_grid(Geom.bar(position=:dodge)), Guide.xlabel(""), Guide.ylabel("Number of HTTP calls", orientation=:vertical), Guide.colorkey(""), Scale.x_discrete, colors())

# # # draw(PDF("amazon/http_calls.pdf", 7inch, 3.5inch), plot_eq)
draw(PDF("amazon/http_calls_eq.pdf", 4.3inch, 3.5inch), plot_eq)
draw(PDF("amazon/http_calls_neq.pdf", 4.3inch, 3.5inch), plot_neq)
draw(PNG("amazon/http_calls_eq.png", 4.3inch, 3.5inch), plot_eq)
draw(PNG("amazon/http_calls_neq.png", 4.3inch, 3.5inch), plot_neq)

draw(PDF("amazon/http_calls_query_eq.pdf", 7inch, 15inch), vstack(plot_calls_query_eq1,plot_calls_query_eq2,plot_calls_query_eq3, plot_calls_query_eq4,plot_calls_query_eq5, plot_calls_query_eq6, plot_calls_query_eq7))
