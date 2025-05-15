# Notes

Unfortunately I did not have access to a Linux- or Mac x64 System so I could only test the executables on a Windows machine and my Macbook with arm architecture. I hope you can run it on either of those systems yourself or execute the index.js file in a node environment otherwise, by running
```bash
node index.js
```
in the root of this project.

I wasn't sure how to implement 6.1.4 - Financial Metrics, Provide real-time calculations for, Average mileage per vehicle, so I implemented it as I found it most sensible by providing an average across all vehicles. This seemed to be most logical when providing a financial overview to the user.
However i added a comment with the query for the other possible way (getting the average mileage per vehicle) at the following method: src/services/FinancialMetricsService.js - getVehicleMileageMetrics

