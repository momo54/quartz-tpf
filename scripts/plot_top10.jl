# Draw plot for Exec per query per server for top10 queries
# Author: Thomas Minier

using Gadfly
using RDatasets

include("utils.jl")

Gadfly.push_theme(panel_theme)

function makePlot(df)
  return plot(df, xgroup=:qname, x=:servers, y=:mean_value, Geom.subplot_grid(Geom.line, Geom.point, Guide.xticks(ticks=[1,2,3,4], orientation=:horizontal), Guide.yticks(ticks=[1200,1000,800,600,400,200,0])), Guide.xlabel("Number of servers per query"), Guide.ylabel("Execution time (s)", orientation=:vertical), Scale.x_discrete)
end

# Execution times

time_ref_run1 = readtable("amazon/top10/run1/execution_times_ref.csv")
time_ref_run2 = readtable("amazon/top10/run2/execution_times_ref.csv")
time_ref_run3 = readtable("amazon/top10/run3/execution_times_ref.csv")

time_ref = meanRun(concatRuns(time_ref_run1, time_ref_run2, time_ref_run3))
time_ref[:qname] = qNumbers(nrow(time_ref_run1))
time_ref[:servers] = 1

time_all_2_run1 = readtable("amazon/top10/run1/execution_times_2.csv")
time_all_2_run2 = readtable("amazon/top10/run2/execution_times_2.csv")
time_all_2_run3 = readtable("amazon/top10/run3/execution_times_2.csv")

time_all_2 = meanRun(concatRuns(time_all_2_run1, time_all_2_run2, time_all_2_run3))
time_all_2[:qname] = qNumbers(nrow(time_all_2_run1))
time_all_2[:servers] = 2

time_all_3_run1 = readtable("amazon/top10/run1/execution_times_3.csv")
time_all_3_run2 = readtable("amazon/top10/run2/execution_times_3.csv")
time_all_3_run3 = readtable("amazon/top10/run3/execution_times_3.csv")

time_all_3 = meanRun(concatRuns(time_all_3_run1, time_all_3_run2, time_all_3_run3))
time_all_3[:qname] = qNumbers(nrow(time_all_3_run1))
time_all_3[:servers] = 3

time_all_4_run1 = readtable("amazon/top10/run1/execution_times_4.csv")
time_all_4_run2 = readtable("amazon/top10/run2/execution_times_4.csv")
time_all_4_run3 = readtable("amazon/top10/run3/execution_times_4.csv")

time_all_4 = meanRun(concatRuns(time_all_4_run1, time_all_4_run2, time_all_4_run3))
time_all_4[:qname] = qNumbers(nrow(time_all_4_run1))
time_all_4[:servers] = 4

# Gather dataframes for plots
# time_all1 = [time_ref[1:5, :];time_all_2[1:5, :];time_all_3[1:5, :];time_all_4[1:5, :]]
# time_all2 = [time_ref[6:10, :];time_all_2[6:10, :];time_all_3[6:10, :];time_all_4[6:10, :]]

# time_plot_1 = makePlot(time_all1)
# time_plot_2 = makePlot(time_all2)
time_plot = makePlot([time_ref;time_all_2;time_all_3;time_all_4])
draw(PDF("amazon/top10_many_servers.pdf", 7inch, 3inch), time_plot)
draw(PNG("amazon/top10_many_servers.png", 7inch, 5inch), time_plot)
# draw(PDF("amazon/top10_many_servers.pdf", 7inch, 5inch), vstack(time_plot_1, time_plot_2))
