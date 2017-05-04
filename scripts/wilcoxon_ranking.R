#!/usr/bin/env Rscript
# Script to produce results of wilcoxon ranking test
# author : Thomas Minier

reference_1 <- read.table("amazon/run1/execution_times_ref.csv", header = TRUE)
reference_2 <- read.table("amazon/run2/execution_times_ref.csv", header = TRUE)
reference_3 <- read.table("amazon/run3/execution_times_ref.csv", header = TRUE)

# EQ
peneloop_eq_1 <- read.table("amazon/run1/eq/execution_times_peneloop_eq.csv", header = TRUE)
peneloop_eq_2 <- read.table("amazon/run2/eq/execution_times_peneloop_eq.csv", header = TRUE)
peneloop_eq_3 <- read.table("amazon/run3/eq/execution_times_peneloop_eq.csv", header = TRUE)

quartz_eq_1 <- read.table("amazon/run1/eq/execution_times_quartz_eq.csv", header = TRUE)
quartz_eq_2 <- read.table("amazon/run2/eq/execution_times_quartz_eq.csv", header = TRUE)
quartz_eq_3 <- read.table("amazon/run3/eq/execution_times_quartz_eq.csv", header = TRUE)

all_eq_1 <- read.table("amazon/run1/eq/execution_times_all_eq.csv", header = TRUE)
all_eq_2 <- read.table("amazon/run2/eq/execution_times_all_eq.csv", header = TRUE)
all_eq_3 <- read.table("amazon/run3/eq/execution_times_all_eq.csv", header = TRUE)

# NEQ
# TODO

# Compute tests

peneloop_eq_1

print("------- EQ -------")

print("------ Run 1 -----")
print("TPF+PeNeLoop: ")
wilcox.test(peneloop_eq_1$time, reference_1$time, alternative="less", conf.level=0.90, paired=TRUE)

print("TPF+QUaRTz: ")
wilcox.test(quartz_eq_1$time, reference_1$time, alternative="less", conf.level=0.90, paired=TRUE)

print("TPF+PeNeLoop+QUaRTz: ")
wilcox.test(all_eq_1$time, reference_1$time, alternative="less", conf.level=0.90, paired=TRUE)

print("------ Run 2 -----")
print("TPF+PeNeLoop: ")
wilcox.test(peneloop_eq_2$time, reference_2$time, alternative="less", conf.level=0.90, paired=TRUE)

print("TPF+QUaRTz: ")
wilcox.test(quartz_eq_2$time, reference_2$time, alternative="less", conf.level=0.90, paired=TRUE)

print("TPF+PeNeLoop+QUaRTz: ")
wilcox.test(all_eq_2$time, reference_2$time, alternative="less", conf.level=0.90, paired=TRUE)

print("------ Run 3 -----")
print("TPF+PeNeLoop: ")
wilcox.test(peneloop_eq_3$time, reference_3$time, alternative="less", conf.level=0.90, paired=TRUE)

print("TPF+QUaRTz: ")
wilcox.test(quartz_eq_3$time, reference_3$time, alternative="less", conf.level=0.90, paired=TRUE)

print("TPF+PeNeLoop+QUaRTz: ")
wilcox.test(all_eq_3$time, reference_3$time, alternative="less", conf.level=0.90, paired=TRUE)
