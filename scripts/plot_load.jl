using Gadfly
using DataFramesMeta
using RDatasets

include("utils.jl")

Gadfly.push_theme(panel_theme)

ref = readtable("../execution_times_ref.csv")
data = readtable("../execution_times_2eq.csv")

ref[:approach] = "TPF"
data[:approach] = "TQP"

p = plot([ref;data], x=:clients, y=:time, color=:approach, Geom.line, Guide.xlabel("Number of clients"), Guide.ylabel("Execution time (s)"), Guide.colorkey("Approach"), colors())
draw(PDF("load.pdf", 4inch, 3inch), p)
