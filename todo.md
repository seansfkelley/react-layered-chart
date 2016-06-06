- selectors should cache more than one call since there may be more than one
  chart AND if ChartProvider starts using selectors they may be executed out
  or order or with alternating instances
