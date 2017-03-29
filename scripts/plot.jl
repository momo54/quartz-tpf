using Gadfly
using RDatasets

panel_theme = Theme(
    key_position = :none
)

Gadfly.push_theme(panel_theme)

function colors()
 return Scale.color_discrete_manual(colorant"#990000", colorant"#ff4000", colorant"#ffbf00")
end

ref = readtable("./execution_times_ref.csv")
data = readtable("./execution_times.csv")

names!(ref, [ :time ])
names!(data, [ :time ])
ref[:servers] = 1
data[:servers] = 2

all = [ref;data]

p = plot(all, x=:servers, y=:time,  color=:servers, Geom.boxplot, Guide.xlabel("Number of servers"), Guide.ylabel("Execution time (s)"), Scale.x_discrete, colors())

draw(PDF("execution_time.pdf", 7inch, 5inch), p)
