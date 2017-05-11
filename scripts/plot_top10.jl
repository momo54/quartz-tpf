using Gadfly
using RDatasets

# Themes
panel_theme = Theme(
  key_position = :top,
  bar_spacing = 0.2px
)

no_colors_guide = Theme(
  key_position = :none,
  default_point_size = 2px
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
  res = DataFrame(mean_value = [])
  for row in eachrow(runs)
    push!(res, [ mean(convert(Array, row)) ])
  end
  return res
end

function qNumbers(nb)
  return map(x -> "Q$x", 1:nb)
end

function makePlot(df)
  return plot(df, xgroup=:qname, x=:servers, y=:mean_value, Geom.subplot_grid(Geom.line, Geom.point, Guide.xticks(ticks=[1,2,3,4], orientation=:horizontal)), Guide.xlabel("Number of servers per query"), Guide.ylabel("Execution time (s)", orientation=:vertical), Scale.x_discrete)
end

# Execution times

time_ref_run1 = readtable("amazon/top10/run1/execution_times_ref.csv")
time_ref_run2 = readtable("amazon/top10/run2/execution_times_ref.csv")
time_ref_run3 = readtable("amazon/top10/run3/execution_times_ref.csv")

time_ref = meanRun(concatRuns(time_ref_run1, time_ref_run2, time_ref_run3))
time_ref[:query] = 1:nrow(time_ref_run1)
time_ref[:qname] = qNumbers(nrow(time_ref_run1))
time_ref[:servers] = 1

time_all_2_run1 = readtable("amazon/top10/run1/execution_times_2.csv")
time_all_2_run2 = readtable("amazon/top10/run2/execution_times_2.csv")
time_all_2_run3 = readtable("amazon/top10/run3/execution_times_2.csv")

time_all_2 = meanRun(concatRuns(time_all_2_run1, time_all_2_run2, time_all_2_run3))
time_all_2[:query] = 1:nrow(time_all_2_run1)
time_all_2[:qname] = qNumbers(nrow(time_all_2_run1))
time_all_2[:servers] = 2

time_all_3_run1 = readtable("amazon/top10/run1/execution_times_3.csv")
time_all_3_run2 = readtable("amazon/top10/run2/execution_times_3.csv")
time_all_3_run3 = readtable("amazon/top10/run3/execution_times_3.csv")

time_all_3 = meanRun(concatRuns(time_all_3_run1, time_all_3_run2, time_all_3_run3))
time_all_3[:query] = 1:nrow(time_all_3_run1)
time_all_3[:qname] = qNumbers(nrow(time_all_3_run1))
time_all_3[:servers] = 3

# Gather dataframes for plots
time_all = [time_ref;time_all_2;time_all_3]

time_plot_1 = makePlot(time_all[time_all[:query] .<= 5, :])
time_plot_2 = makePlot(time_all[time_all[:query] .> 5, :])

draw(PDF("amazon/top10_many_servers.pdf", 7inch, 5inch), vstack(time_plot_1, time_plot_2))
