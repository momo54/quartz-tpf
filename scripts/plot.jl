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

time_ref_run1 = readtable("amazon/run1/execution_times_ref.csv")
time_ref_run2 = readtable("amazon/run2/execution_times_ref.csv")
time_ref_run3 = readtable("amazon/run3/execution_times_ref.csv")

time_ref = meanRun(concatRuns(time_ref_run1, time_ref_run2, time_ref_run3))
time_ref[:query] = 1:nrow(time_ref_run1)
time_ref[:servers] = "TPF"

# EQ
time_quartz_eq_run1 = readtable("amazon/run1/eq/execution_times_quartz_eq.csv")
time_quartz_eq_run2 = readtable("amazon/run2/eq/execution_times_quartz_eq.csv")
time_quartz_eq_run3 = readtable("amazon/run3/eq/execution_times_quartz_eq.csv")

time_peneloop_eq_run1 = readtable("amazon/run1/eq/execution_times_peneloop_eq.csv")
time_peneloop_eq_run2 = readtable("amazon/run2/eq/execution_times_peneloop_eq.csv")
time_peneloop_eq_run3 = readtable("amazon/run3/eq/execution_times_peneloop_eq.csv")

time_all_eq_run1 = readtable("amazon/run1/eq/execution_times_all_eq.csv")
time_all_eq_run2 = readtable("amazon/run2/eq/execution_times_all_eq.csv")
time_all_eq_run3 = readtable("amazon/run3/eq/execution_times_all_eq.csv")

time_quartz_eq = meanRun(concatRuns(time_quartz_eq_run1, time_quartz_eq_run2, time_quartz_eq_run3))
time_peneloop_eq = meanRun(concatRuns(time_peneloop_eq_run1, time_peneloop_eq_run2, time_peneloop_eq_run3))
time_all_eq = meanRun(concatRuns(time_all_eq_run1, time_all_eq_run2, time_all_eq_run3))

time_quartz_eq[:query] = 1:nrow(time_quartz_eq_run1)
time_quartz_eq[:servers] = "TPF+QUaRTz-EQ"
time_peneloop_eq[:query] = 1:nrow(time_peneloop_eq_run1)
time_peneloop_eq[:servers] = "TPF+PeNeLoop-EQ"
time_all_eq[:query] = 1:nrow(time_all_eq_run1)
time_all_eq[:servers] = "TPF+PeNeLoop+QUaRTz-EQ"

# NEQ
time_quartz_neq_run1 = readtable("amazon/run1/neq/execution_times_quartz_neq.csv")
time_quartz_neq_run2 = readtable("amazon/run2/neq/execution_times_quartz_neq.csv")
time_quartz_neq_run3 = readtable("amazon/run3/neq/execution_times_quartz_neq.csv")

time_peneloop_neq_run1 = readtable("amazon/run1/neq/execution_times_peneloop_neq.csv")
time_peneloop_neq_run2 = readtable("amazon/run2/neq/execution_times_peneloop_neq.csv")
time_peneloop_neq_run3 = readtable("amazon/run3/neq/execution_times_peneloop_neq.csv")

time_all_neq_run1 = readtable("amazon/run1/neq/execution_times_all_neq.csv")
time_all_neq_run2 = readtable("amazon/run2/neq/execution_times_all_neq.csv")
time_all_neq_run3 = readtable("amazon/run3/neq/execution_times_all_neq.csv")

time_quartz_neq = meanRun(concatRuns(time_quartz_neq_run1, time_quartz_neq_run2, time_quartz_neq_run3))
time_peneloop_neq = meanRun(concatRuns(time_peneloop_neq_run1, time_peneloop_neq_run2, time_peneloop_neq_run3))
time_all_neq = meanRun(concatRuns(time_all_neq_run1, time_all_neq_run2, time_all_neq_run3))

time_quartz_neq[:query] = 1:nrow(time_quartz_neq_run1)
time_quartz_neq[:servers] = "TPF+QUaRTz-NEQ"
time_peneloop_neq[:query] = 1:nrow(time_peneloop_neq_run1)
time_peneloop_neq[:servers] = "TPF+PeNeLoop-NEQ"
time_all_neq[:query] = 1:nrow(time_all_neq_run1)
time_all_neq[:servers] = "TPF+PeNeLoop+QUaRTz-NEQ"

# Completeness

# EQ
compl_quartz_eq_run1 = readtable("amazon/run1/eq/completeness_quartz_eq.csv")
compl_quartz_eq_run2 = readtable("amazon/run2/eq/completeness_quartz_eq.csv")
compl_quartz_eq_run3 = readtable("amazon/run3/eq/completeness_quartz_eq.csv")

compl_peneloop_eq_run1 = readtable("amazon/run1/eq/completeness_peneloop_eq.csv")
compl_peneloop_eq_run2 = readtable("amazon/run2/eq/completeness_peneloop_eq.csv")
compl_peneloop_eq_run3 = readtable("amazon/run3/eq/completeness_peneloop_eq.csv")

compl_all_eq_run1 = readtable("amazon/run1/eq/completeness_all_eq.csv")
compl_all_eq_run2 = readtable("amazon/run2/eq/completeness_all_eq.csv")
compl_all_eq_run3 = readtable("amazon/run3/eq/completeness_all_eq.csv")

# NEQ
# compl_quartz_neq_run1 = readtable("amazon/run1/neq/completeness_quartz_neq.csv")
# compl_quartz_neq_run2 = readtable("amazon/run2/neq/completeness_quartz_neq.csv")
# compl_quartz_neq_run3 = readtable("amazon/run3/neq/completeness_quartz_neq.csv")
#
# compl_peneloop_neq_run1 = readtable("amazon/run1/neq/completeness_peneloop_neq.csv")
# compl_peneloop_neq_run2 = readtable("amazon/run2/neq/completeness_peneloop_neq.csv")
# compl_peneloop_neq_run3 = readtable("amazon/run3/neq/completeness_peneloop_neq.csv")
#
# compl_all_neq_run1 = readtable("amazon/run1/neq/completeness_all_neq.csv")
# compl_all_neq_run2 = readtable("amazon/run2/neq/completeness_all_neq.csv")
# compl_all_neq_run3 = readtable("amazon/run3/neq/completeness_all_neq.csv")

compl_quartz_eq = meanRun(concatRuns(compl_quartz_eq_run1, compl_quartz_eq_run2, compl_quartz_eq_run3))
compl_peneloop_eq = meanRun(concatRuns(compl_peneloop_eq_run1, compl_peneloop_eq_run2, compl_peneloop_eq_run3))
compl_all_eq = meanRun(concatRuns(compl_all_eq_run1, compl_all_eq_run2, compl_all_eq_run3))

# compl_quartz_neq = meanRun(concatRuns(compl_quartz_neq_run1, compl_quartz_neq_run2, compl_quartz_neq_run3))
# compl_peneloop_neq = meanRun(concatRuns(compl_peneloop_neq_run1, compl_peneloop_neq_run2, compl_peneloop_neq_run3))
# compl_all_neq = meanRun(concatRuns(compl_all_neq_run1, compl_all_neq_run2, compl_all_neq_run3))

compl_quartz_eq[:query] = 1:nrow(compl_quartz_eq_run1)
compl_quartz_eq[:servers] = "TPF+Q-EQ"
compl_peneloop_eq[:query] = 1:nrow(compl_peneloop_eq_run1)
compl_peneloop_eq[:servers] = "TPF+P-EQ"
compl_all_eq[:query] = 1:nrow(compl_all_eq_run1)
compl_all_eq[:servers] = "TPF+P+Q-EQ"

# compl_quartz_neq[:query] = 1:nrow(compl_quartz_neq_run1)
# compl_quartz_neq[:servers] = "TPF+Q-NEQ"
# compl_peneloop_neq[:query] = 1:nrow(compl_peneloop_neq_run1)
# compl_peneloop_neq[:servers] = "TPF+P-NEQ"
# compl_all_neq[:query] = 1:nrow(compl_all_neq_run1)
# compl_all_neq[:servers] = "TPF+P+Q-NEQ"

# Gather dataframes for plots
time_all = [time_ref;time_peneloop_eq;time_quartz_eq;time_all_eq]
time_all2 = [time_ref;time_peneloop_neq;time_quartz_neq;time_all_neq]
compl_all = [compl_peneloop_eq;compl_quartz_eq;compl_all_eq]

time_plot_1 = plot(time_all[time_all[:query] .<= 50, :], x=:query, y=:mean_value, color=:servers, Geom.bar(position=:dodge,orientation=:vertical), Guide.xlabel("Queries"), Guide.ylabel("Execution time (s)", orientation=:vertical), Guide.colorkey(""), Scale.x_continuous, colors(), Guide.xticks(ticks=[0,5,10,15,20,25,30,35,40,45,50]),
Guide.yticks(ticks=[0,400,800,1200]))
time_plot_2 = plot(time_all[time_all[:query] .> 50, :], x=:query, y=:mean_value, color=:servers, Geom.bar(position=:dodge,orientation=:vertical), Guide.xlabel("Queries"), Guide.ylabel("Execution time (s)", orientation=:vertical), Guide.colorkey(""), Scale.x_continuous, colors(), Guide.xticks(ticks=[50,55,60,65,70,75,80,85,90,95]), Guide.yticks(ticks=[0,400,800,1200]))

time_plot_12 = plot(time_all2[time_all2[:query] .<= 50, :], x=:query, y=:mean_value, color=:servers, Geom.bar(position=:dodge,orientation=:vertical), Guide.xlabel("Queries"), Guide.ylabel("Execution time (s)", orientation=:vertical), Guide.colorkey(""), Scale.x_continuous, colors(), Guide.xticks(ticks=[0,5,10,15,20,25,30,35,40,45,50]), Guide.yticks(ticks=[0,400,800,1200]))
time_plot_22 = plot(time_all2[time_all2[:query] .> 50, :], x=:query, y=:mean_value, color=:servers, Geom.bar(position=:dodge,orientation=:vertical), Guide.xlabel("Queries"), Guide.ylabel("Execution time (s)", orientation=:vertical), Guide.colorkey(""), Scale.x_continuous, colors(), Guide.xticks(ticks=[50,55,60,65,70,75,80,85,90,95]), Guide.yticks(ticks=[0,400,800,1200]))

compl_plot = plot(compl_all, xgroup=:servers, x=:query, y=:mean_value, color=:servers, Geom.subplot_grid(Geom.bar), Guide.xlabel("Queries"), Guide.ylabel("Answer completeness"), Scale.y_continuous, colors(), no_colors_guide)

draw(PDF("amazon/execution_time_eq.pdf", 7inch, 5inch), vstack(time_plot_1, time_plot_2))
draw(PDF("amazon/execution_time_neq.pdf", 7inch, 5inch), vstack(time_plot_12, time_plot_22))
draw(PDF("amazon/completeness.pdf", 8inch, 4inch), compl_plot)
