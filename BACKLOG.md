# Website backlog

## Rendering speedup at different levels of free local RAM

- [ ] Run rendering comparisons with **1 GB, 2 GB, 4 GB and 6 GB of free local RAM**, then prepare the measured results for the website. Requested 2 November 2026. Backlog only, not started.

Compare local rendering against rendering with Seamless at each RAM level, using the same scene, render settings and output quality. Record actual available RAM before each run, render times, offload route and hardware, swap/memory pressure, and whether the output completed correctly. Repeat comparable runs and calculate the speedup as local render time divided by Seamless render time. Report startup overhead separately from warm performance, and retain failed runs. If local rendering cannot finish, report that outcome rather than inventing a speedup multiple.

Use the verified measurements to show how the rendering speedup changes with free local RAM. Testing and website publication remain future work.
