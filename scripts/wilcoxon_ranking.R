#!/usr/bin/env Rscript
# Script to produce results of wilcoxon ranking test
# author : Thomas Minier

reference_1 <- read.table("amazon/run1/execution_times_ref.csv")
reference_2 <- read.table("amazon/run2/execution_times_ref.csv")
reference_3 <- read.table("amazon/run3/execution_times_ref.csv")

# EQ
peneloop_eq_1 <- read.table("amazon/run1/eq/execution_times_peneloop_eq.csv")
peneloop_eq_2 <- read.table("amazon/run2/eq/execution_times_peneloop_eq.csv")
peneloop_eq_3 <- read.table("amazon/run3/eq/execution_times_peneloop_eq.csv")

quartz_eq_1 <- read.table("amazon/run1/eq/execution_times_quartz_eq.csv")
quartz_eq_2 <- read.table("amazon/run2/eq/execution_times_quartz_eq.csv")
quartz_eq_3 <- read.table("amazon/run3/eq/execution_times_quartz_eq.csv")

all_eq_1 <- read.table("amazon/run1/eq/execution_times_all_eq.csv")
all_eq_2 <- read.table("amazon/run2/eq/execution_times_all_eq.csv")
all_eq_3 <- read.table("amazon/run3/eq/execution_times_all_eq.csv")

# NEQ
# TODO

# Compute tests

print("------- EQ -------")
print("------ Run 1 -----")
print("TPF+PeNeLoop: ")
wilcox.test(as.numeric(unlist(peneloop_eq_1[0])), as.numeric(unlist(reference_1[0])), alternative="less", conf.level=0.90, paired=TRUE)
