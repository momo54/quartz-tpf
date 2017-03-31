using Gadfly
using Dataframe
using RDatasets

panel_theme = Theme(
    key_position = :none
)

Gadfly.push_theme(panel_theme)

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
  res = DataFrame(time = [])
  for row in eachrow(runs)
    push!(res, [ mean(convert(Array, row)) ])
  end
  return res
end

ref_run1 = readtable("amazon/run1/execution_times_ref.csv")
ref_run2 = readtable("amazon/run2/execution_times_ref.csv")
ref_run3 = readtable("amazon/run3/execution_times_ref.csv")
data_run1 = readtable("amazon/run1/execution_times.csv")
data_run2 = readtable("amazon/run2/execution_times.csv")
data_run3 = readtable("amazon/run3/execution_times.csv")

ref = meanRun(concatRuns(ref_run1, ref_run2, ref_run3))
data = meanRun(concatRuns(data_run1, data_run2, data_run3))

ref[:servers] = 1
ref[:l] = 1
data[:servers] = 2
data[:l] = 1

all = [ref;data]
big = all[all[:time] .>= 3.0, :]

p = plot(all, x=:servers, y=:time, color=:servers, Geom.boxplot, Guide.xlabel("Number of servers"), Guide.ylabel("Execution time (s)"), Scale.x_discrete, Scale.y_log10, colors())
pbig = plot(big, x=:servers, y=:time, color=:servers, Geom.boxplot, Guide.xlabel("Number of servers"), Guide.ylabel("Execution time (s)"), Scale.x_discrete, Scale.y_log10, colors())

draw(PDF("amazon/execution_time.pdf", 7inch, 5inch), p)
draw(PDF("amazon/execution_time_greater_3s.pdf", 7inch, 5inch), pbig)
