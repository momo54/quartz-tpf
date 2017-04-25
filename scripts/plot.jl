using Gadfly
using RDatasets

# Themes
panel_theme = Theme(
  bar_spacing = 1px
)

no_colors_guide = Theme(
  key_position = :none,
  default_point_size = 2px
)

Gadfly.push_theme(panel_theme)

# Custom color scale for plots
function colors()
 return Scale.color_discrete_manual(colorant"#990000", colorant"#ffbf00")
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

# Execution times
time_ref_run1 = readtable("amazon/run1/execution_times_ref.csv")
time_ref_run2 = readtable("amazon/run2/execution_times_ref.csv")
time_ref_run3 = readtable("amazon/run3/execution_times_ref.csv")
time_data_run1 = readtable("amazon/run1/execution_times.csv")
time_data_run2 = readtable("amazon/run2/execution_times.csv")
time_data_run3 = readtable("amazon/run3/execution_times.csv")
time_london_run1 = readtable("amazon/run1/execution_times_london.csv")
time_london_run2 = readtable("amazon/run2/execution_times_london.csv")
time_london_run3 = readtable("amazon/run3/execution_times_london.csv")

time_ref = meanRun(concatRuns(time_ref_run1, time_ref_run2, time_ref_run3))
time_data = meanRun(concatRuns(time_data_run1, time_data_run2, time_data_run3))
time_london = meanRun(concatRuns(time_london_run1, time_london_run2, time_london_run3))

time_ref[:query] = 1:nrow(time_ref_run1)
time_ref[:servers] = "TPF-1"
time_data[:query] = 1:nrow(time_data_run1)
time_data[:servers] = "TPF+QR-VTP-EQ"
time_london[:query] = 1:nrow(time_london_run1)
time_london[:servers] = "TPF+QR-VTP-NEQ"

# Completeness
compl_ref_run1 = readtable("amazon/run1/completeness_ref.csv")
compl_ref_run2 = readtable("amazon/run2/completeness_ref.csv")
compl_ref_run3 = readtable("amazon/run3/completeness_ref.csv")
compl_data_run1 = readtable("amazon/run1/completeness.csv")
compl_data_run2 = readtable("amazon/run2/completeness.csv")
compl_data_run3 = readtable("amazon/run3/completeness.csv")

compl_ref = meanRun(concatRuns(compl_ref_run1, compl_ref_run2, compl_ref_run3))
compl_data = meanRun(concatRuns(compl_data_run1, compl_data_run2, compl_data_run3))

compl_ref[:query] = 1:nrow(compl_ref_run1)
compl_ref[:servers] = "TPF-1"
compl_data[:query] = 1:nrow(compl_data_run1)
compl_data[:servers] = "TPF+QR-VTP-EQ"

# Gather dataframes for plots
time_all = [time_ref;time_data;time_london]
compl_all = [compl_ref;compl_data]
# big = all[all[:time] .>= 1.0, :]

time_plot = plot(time_all, x=:query, y=:mean_value, color=:servers, Geom.bar(position=:dodge), Guide.xlabel("Queries"), Guide.ylabel("Execution time (s)"), Guide.colorkey("Approach"), Scale.x_continuous, colors())
# compl_plot = plot(compl_all, x=:query, y=:mean_value, color=:servers, Geom.boxplot, Guide.xlabel("Queries"), Guide.ylabel("Answer completeness"), Guide.colorkey("Servers"), Scale.x_continuous, colors())
compl_plot = plot(compl_all, xgroup=:servers, x=:query, y=:mean_value, color=:servers, Geom.subplot_grid(Geom.point), Guide.xlabel("Queries"), Guide.ylabel("Answer completeness"), Scale.x_continuous, colors(), no_colors_guide)
# pbig = plot(big, x=:servers, y=:time, color=:servers, Geom.boxplot, Guide.xlabel("Number of servers"), Guide.ylabel("Execution time (s)"), Scale.x_discrete, Scale.y_log10, colors())

draw(PDF("amazon/execution_time.pdf", 8inch, 5inch), time_plot)
draw(PDF("amazon/completeness.pdf", 10inch, 3inch), compl_plot)
# draw(PDF("amazon/execution_time_greater_3s.pdf", 7inch, 5inch), pbig)
