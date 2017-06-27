# Draw main plots for execution time & completeness
# Author: Thomas Minier
using Gadfly
using RDatasets

include("utils.jl")

custom_theme = Theme(
  key_position = :top,
  bar_spacing = 0.2px
)

Gadfly.push_theme(custom_theme)

blacklist = [3,6,7,8,9,11,14,15,16,18,19,20,22,24,26,27,28,30,32,33,34,36,40,42,44,46,49,51,52,56,57,60,64,65,66,67,68,73,74,76,79,82,85,89,93]
whitelist = [47, 48, 52, 78, 12]

function processData(df, list)
  return DataFrame(clean(df, list))
end

function processDataBis(df, list)
  return DataFrame(cleanBis(df, list))
end

function getBlacklist(ref)
  res = []
  groups = groupby(ref, [:query])
  for group in groups
    if group[1, :calls] == 0 || group[2, :calls] == 0
      push!(res, group[1, :query])
    end
  end
  return res
end

function makeTimeplotEQ(df, full = true)
  if full
    return plot(df, xgroup=:query, x=:servers, y=:mean_value, color=:servers, Geom.subplot_grid(Geom.bar(position=:dodge,orientation=:vertical), Guide.xticks(label=false), free_y_axis=true), Guide.xlabel("Query"), Guide.ylabel("Execution time (s)", orientation=:vertical), Guide.colorkey(""), colors())
  else
    return plot(df, xgroup=:query, x=:servers, y=:mean_value, color=:servers, Geom.subplot_grid(Geom.bar(position=:dodge,orientation=:vertical), Guide.xticks(label=false), free_y_axis=true), Guide.xlabel("Query"), Guide.ylabel("Execution time (s)", orientation=:vertical), Guide.colorkey(""), colors())
  end
end

function makeTimeplotNEQ(df, full = true)
  if full
    return plot(df, xgroup=:query, x=:servers, y=:mean_value, color=:servers, Geom.subplot_grid(Geom.bar(position=:dodge,orientation=:vertical), Guide.xticks(label=false), free_y_axis=true), Guide.xlabel("Query"), Guide.ylabel("Execution time (s)", orientation=:vertical), Guide.colorkey(""), colors())
  else
    return plot(df, xgroup=:query, x=:servers, y=:mean_value, color=:servers, Geom.subplot_grid(Geom.bar(position=:dodge,orientation=:vertical), Guide.xticks(label=false), free_y_axis=true), Guide.xlabel("Query"), Guide.ylabel("Execution time (s)", orientation=:vertical), Guide.colorkey(""), colors())
  end
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
time_quartz_eq[:servers] = "TQ-EQ"
time_peneloop_eq[:query] = 1:nrow(time_peneloop_eq_run1)
time_peneloop_eq[:servers] = "TP-EQ"
time_all_eq[:query] = 1:nrow(time_all_eq_run1)
time_all_eq[:servers] = "TQP-EQ"

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
time_quartz_neq[:servers] = "TQ-NEQ"
time_peneloop_neq[:query] = 1:nrow(time_peneloop_neq_run1)
time_peneloop_neq[:servers] = "TP-NEQ"
time_all_neq[:query] = 1:nrow(time_all_neq_run1)
time_all_neq[:servers] = "TQP-NEQ"

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
compl_quartz_neq_run1 = readtable("amazon/run1/neq/completeness_quartz_neq.csv")
compl_quartz_neq_run2 = readtable("amazon/run2/neq/completeness_quartz_neq.csv")
compl_quartz_neq_run3 = readtable("amazon/run3/neq/completeness_quartz_neq.csv")

compl_peneloop_neq_run1 = readtable("amazon/run1/neq/completeness_peneloop_neq.csv")
compl_peneloop_neq_run2 = readtable("amazon/run2/neq/completeness_peneloop_neq.csv")
compl_peneloop_neq_run3 = readtable("amazon/run3/neq/completeness_peneloop_neq.csv")

compl_all_neq_run1 = readtable("amazon/run1/neq/completeness_all_neq.csv")
compl_all_neq_run2 = readtable("amazon/run2/neq/completeness_all_neq.csv")
compl_all_neq_run3 = readtable("amazon/run3/neq/completeness_all_neq.csv")

compl_quartz_eq = meanRun(concatRuns(compl_quartz_eq_run1, compl_quartz_eq_run2, compl_quartz_eq_run3))
compl_peneloop_eq = meanRun(concatRuns(compl_peneloop_eq_run1, compl_peneloop_eq_run2, compl_peneloop_eq_run3))
compl_all_eq = meanRun(concatRuns(compl_all_eq_run1, compl_all_eq_run2, compl_all_eq_run3))

compl_quartz_neq = meanRun(concatRuns(compl_quartz_neq_run1, compl_quartz_neq_run2, compl_quartz_neq_run3))
compl_peneloop_neq = meanRun(concatRuns(compl_peneloop_neq_run1, compl_peneloop_neq_run2, compl_peneloop_neq_run3))
compl_all_neq = meanRun(concatRuns(compl_all_neq_run1, compl_all_neq_run2, compl_all_neq_run3))

compl_quartz_eq[:query] = 1:nrow(compl_quartz_eq_run1)
compl_quartz_eq[:servers] = "TQ-EQ"
compl_peneloop_eq[:query] = 1:nrow(compl_peneloop_eq_run1)
compl_peneloop_eq[:servers] = "TP-EQ"
compl_all_eq[:query] = 1:nrow(compl_all_eq_run1)
compl_all_eq[:servers] = "TQP-EQ"

compl_quartz_neq[:query] = 1:nrow(compl_quartz_neq_run1)
compl_quartz_neq[:servers] = "TQ-NEQ"
compl_peneloop_neq[:query] = 1:nrow(compl_peneloop_neq_run1)
compl_peneloop_neq[:servers] = "TP-NEQ"
compl_all_neq[:query] = 1:nrow(compl_all_neq_run1)
compl_all_neq[:servers] = "TQP-NEQ"

# Gather dataframes for plots
time_all = [time_ref;time_peneloop_eq;time_quartz_eq;time_all_eq]
time_all2 = [time_ref;time_peneloop_neq;time_quartz_neq;time_all_neq]
compl_all = [compl_peneloop_eq;compl_quartz_eq;compl_all_eq;compl_peneloop_neq;compl_quartz_neq;compl_all_neq]

# filter data for another plot
filter_ref = processDataBis(time_ref, whitelist)
filter_ref[:query] = [12, 47, 48, 52, 78]

filter_pen_eq = processDataBis(time_peneloop_eq, whitelist)
filter_pen_eq[:query] = [12, 47, 48, 52, 78]
filter_quartz_eq = processDataBis(time_quartz_eq, whitelist)
filter_quartz_eq[:query] = [12, 47, 48, 52, 78]
filter_all_eq = processDataBis(time_all_eq, whitelist)
filter_all_eq[:query] = [12, 47, 48, 52, 78]

filter_pen_neq = processDataBis(time_peneloop_neq, whitelist)
filter_pen_neq[:query] = [12, 47, 48, 52, 78]
filter_quartz_neq = processDataBis(time_quartz_neq, whitelist)
filter_quartz_neq[:query] = [12, 47, 48, 52, 78]
filter_all_neq = processDataBis(time_all_neq, whitelist)
filter_all_neq[:query] = [12, 47, 48, 52, 78]

filtered_all_eq = [filter_ref;filter_pen_eq;filter_quartz_eq;filter_all_eq]
filtered_all_neq = [filter_ref;filter_pen_neq;filter_quartz_neq;filter_all_neq]

time_plot_1 = plot(time_all[time_all[:query] .<= 50, :], x=:query, y=:mean_value, color=:servers, Geom.bar(position=:dodge,orientation=:vertical), Guide.xlabel("Queries"), Guide.ylabel("Execution time (s)", orientation=:vertical), Guide.colorkey(""), Scale.x_continuous, colors(), Guide.xticks(ticks=[0,5,10,15,20,25,30,35,40,45,50]), Guide.yticks(ticks=[0,400,800,1200]))
time_plot_2 = plot(time_all[time_all[:query] .> 50, :], x=:query, y=:mean_value, color=:servers, Geom.bar(position=:dodge,orientation=:vertical), Guide.xlabel("Queries"), Guide.ylabel("Execution time (s)", orientation=:vertical), Guide.colorkey(""), Scale.x_continuous, colors(), Guide.xticks(ticks=[50,55,60,65,70,75,80,85,90,95]), Guide.yticks(ticks=[0,400,800,1200]))

time_plot_12 = plot(time_all2[time_all2[:query] .<= 50, :], x=:query, y=:mean_value, color=:servers, Geom.bar(position=:dodge,orientation=:vertical), Guide.xlabel("Queries"), Guide.ylabel("Execution time (s)", orientation=:vertical), Guide.colorkey(""), Scale.x_continuous, colors(), Guide.xticks(ticks=[0,5,10,15,20,25,30,35,40,45,50]), Guide.yticks(ticks=[0,400,800,1200]))
time_plot_22 = plot(time_all2[time_all2[:query] .> 50, :], x=:query, y=:mean_value, color=:servers, Geom.bar(position=:dodge,orientation=:vertical), Guide.xlabel("Queries"), Guide.ylabel("Execution time (s)", orientation=:vertical), Guide.colorkey(""), Scale.x_continuous, colors(), Guide.xticks(ticks=[50,55,60,65,70,75,80,85,90,95]), Guide.yticks(ticks=[0,400,800,1200]))

time_plot_1 = makeTimeplotEQ(time_all)
time_plot_2 = makeTimeplotNEQ(time_all2)

filtered_plot_1 = makeTimeplotEQ(filtered_all_eq, false)
filtered_plot_2 = makeTimeplotNEQ(filtered_all_neq, false)

compl_plot = plot(compl_all, xgroup=:servers, x=:query, y=:mean_value, color=:servers, Geom.subplot_grid(Geom.bar), Guide.xlabel("Queries"), Guide.ylabel("Answer completeness"), Scale.y_continuous, colors(), no_colors_guide)

draw(PDF("amazon/execution_time_eq.pdf", 7inch, 2.5inch), time_plot_1)
draw(PDF("amazon/execution_time_neq.pdf", 7inch, 2.5inch), time_plot_2)
draw(PDF("amazon/execution_time_filter_eq.pdf", 4inch, 2.5inch), filtered_plot_1)
draw(PDF("amazon/execution_time_filter_neq.pdf", 7inch, 2.5inch), filtered_plot_2)
draw(PNG("amazon/execution_time_eq.png", 7inch, 2.5inch), time_plot_1)
draw(PNG("amazon/execution_time_neq.png", 7inch, 2.5inch), time_plot_2)
draw(PNG("amazon/execution_time_filter_eq.png", 7inch, 2.5inch), filtered_plot_1)
draw(PNG("amazon/execution_time_filter_neq.png", 7inch, 2.5inch), filtered_plot_2)
draw(PDF("amazon/completeness.pdf", 8inch, 4inch), compl_plot)
draw(PNG("amazon/completeness.png", 8inch, 4inch), compl_plot)
