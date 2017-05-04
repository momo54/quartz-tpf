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

# Execution times

# EQ
time_ref_run1 = readtable("amazon/run1/execution_times_ref.csv")
time_ref_run2 = readtable("amazon/run2/execution_times_ref.csv")
time_ref_run3 = readtable("amazon/run3/execution_times_ref.csv")

time_quartz_eq_run1 = readtable("amazon/run1/eq/execution_times_quartz_eq.csv")
time_quartz_eq_run2 = readtable("amazon/run2/eq/execution_times_quartz_eq.csv")
time_quartz_eq_run3 = readtable("amazon/run3/eq/execution_times_quartz_eq.csv")

time_peneloop_eq_run1 = readtable("amazon/run1/eq/execution_times_peneloop_eq.csv")
time_peneloop_eq_run2 = readtable("amazon/run2/eq/execution_times_peneloop_eq.csv")
time_peneloop_eq_run3 = readtable("amazon/run3/eq/execution_times_peneloop_eq.csv")

time_all_eq_run1 = readtable("amazon/run1/eq/execution_times_all_eq.csv")
time_all_eq_run2 = readtable("amazon/run2/eq/execution_times_all_eq.csv")
time_all_eq_run3 = readtable("amazon/run3/eq/execution_times_all_eq.csv")

time_ref = meanRun(concatRuns(time_ref_run1, time_ref_run2, time_ref_run3))
time_quartz_eq = meanRun(concatRuns(time_quartz_eq_run1, time_quartz_eq_run2, time_quartz_eq_run3))
time_peneloop_eq = meanRun(concatRuns(time_peneloop_eq_run1, time_peneloop_eq_run2, time_peneloop_eq_run3))
time_all_eq = meanRun(concatRuns(time_all_eq_run1, time_all_eq_run2, time_all_eq_run3))

time_ref[:query] = 1:nrow(time_ref_run1)
time_ref[:servers] = "TPF"
time_quartz_eq[:query] = 1:nrow(time_quartz_eq_run1)
time_quartz_eq[:servers] = "TPF+QUaRTz-EQ"
time_peneloop_eq[:query] = 1:nrow(time_peneloop_eq_run1)
time_peneloop_eq[:servers] = "TPF+PeNeLoop-EQ"
time_all_eq[:query] = 1:nrow(time_all_eq_run1)
time_all_eq[:servers] = "TPF+PeNeLoop+QUaRTz-EQ"

# NEQ

time_london_run1 = readtable("amazon/run1/execution_times_london.csv")
time_london_run2 = readtable("amazon/run2/execution_times_london.csv")
time_london_run3 = readtable("amazon/run3/execution_times_london.csv")

time_london = meanRun(concatRuns(time_london_run1, time_london_run2, time_london_run3))

time_london[:query] = 1:nrow(time_london_run1)
time_london[:servers] = "TPF+QUaRTz-NEQ"

# Completeness
compl_quartz_eq_run1 = readtable("amazon/run1/eq/completeness_quartz_eq.csv")
compl_quartz_eq_run2 = readtable("amazon/run2/eq/completeness_quartz_eq.csv")
compl_quartz_eq_run3 = readtable("amazon/run3/eq/completeness_quartz_eq.csv")

compl_peneloop_eq_run1 = readtable("amazon/run1/eq/completeness_peneloop_eq.csv")
compl_peneloop_eq_run2 = readtable("amazon/run2/eq/completeness_peneloop_eq.csv")
compl_peneloop_eq_run3 = readtable("amazon/run3/eq/completeness_peneloop_eq.csv")

compl_all_eq_run1 = readtable("amazon/run1/eq/completeness_all_eq.csv")
compl_all_eq_run2 = readtable("amazon/run2/eq/completeness_all_eq.csv")
compl_all_eq_run3 = readtable("amazon/run3/eq/completeness_all_eq.csv")

compl_quartz_eq = meanRun(concatRuns(compl_quartz_eq_run1, compl_quartz_eq_run2, compl_quartz_eq_run3))
compl_peneloop_eq = meanRun(concatRuns(compl_peneloop_eq_run1, compl_peneloop_eq_run2, compl_peneloop_eq_run3))
compl_all_eq = meanRun(concatRuns(compl_all_eq_run1, compl_all_eq_run2, compl_all_eq_run3))

compl_quartz_eq[:query] = 1:nrow(compl_quartz_eq_run1)
compl_quartz_eq[:servers] = "TPF+Q-EQ"
compl_peneloop_eq[:query] = 1:nrow(compl_peneloop_eq_run1)
compl_peneloop_eq[:servers] = "TPF+P-EQ"
compl_all_eq[:query] = 1:nrow(compl_all_eq_run1)
compl_all_eq[:servers] = "TPF+P+Q-EQ"

# Gather dataframes for plots
time_all = [time_ref;time_peneloop_eq;time_quartz_eq;time_all_eq]
compl_all = [compl_peneloop_eq;compl_quartz_eq;compl_all_eq]

time_plot_1 = plot(time_all[time_all[:query] .<= 50, :], x=:query, y=:mean_value, color=:servers, Geom.bar(position=:dodge,orientation=:vertical), Guide.xlabel("Queries"), Guide.ylabel("Execution time (s)", orientation=:vertical), Guide.colorkey(""), Scale.x_continuous, colors(), Guide.xticks(ticks=[0,10,20,30,40,50]))
time_plot_2 = plot(time_all[time_all[:query] .> 50, :], x=:query, y=:mean_value, color=:servers, Geom.bar(position=:dodge,orientation=:vertical), Guide.xlabel("Queries"), Guide.ylabel("Execution time (s)", orientation=:vertical), Guide.colorkey(""), Scale.x_continuous, colors())

compl_plot = plot(compl_all, xgroup=:servers, x=:query, y=:mean_value, color=:servers, Geom.subplot_grid(Geom.bar), Guide.xlabel("Queries"), Guide.ylabel("Answer completeness"), Scale.y_continuous, colors(), no_colors_guide)


draw(PDF("amazon/execution_time_eq.pdf", 8inch, 5inch), vstack(time_plot_1, time_plot_2))
draw(PDF("amazon/completeness.pdf", 8inch, 4inch), compl_plot)
# draw(PDF("amazon/execution_time_greater_3s.pdf", 7inch, 5inch), pbig)
