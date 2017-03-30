using Gadfly
using RDatasets

panel_theme = Theme(
    key_position = :none
)

Gadfly.push_theme(panel_theme)

function colors()
 return Scale.color_discrete_manual(colorant"#990000", colorant"#ff4000", colorant"#ffbf00")
end

ref = readtable("amazon/execution_times_ref.csv")
data = readtable("amazon/execution_times.csv")

ref[:servers] = 1
data[:servers] = 2

all = [ref;data]
big = all[all[:time] .>= 3.0, :]

p = plot(all, x=:servers, y=:time,  color=:servers, Geom.boxplot, Guide.xlabel("Number of servers"), Guide.ylabel("Execution time (s)"), Scale.x_discrete, Scale.y_log10, colors())
pbig = plot(big, x=:servers, y=:time,  color=:servers, Geom.boxplot, Guide.xlabel("Number of servers"), Guide.ylabel("Execution time (s)"), Scale.x_discrete, Scale.y_log10, colors())

draw(PDF("amazon/execution_time.pdf", 7inch, 5inch), p)
draw(PDF("amazon/execution_time_greater_3s.pdf", 7inch, 5inch), pbig)
