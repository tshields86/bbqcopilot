# keepalive branch

This branch exists only to keep GitHub from auto-disabling the scheduled
`Keepalive` workflow on `main`.

GitHub disables scheduled workflows in public repositories after 60 days of no
repository activity. `.github/workflows/keepalive.yml` pushes a weekly timestamp
to `last-run.txt` here, which counts as repository activity and resets that clock.
That workflow, in turn, pings the Supabase database twice a day so the Free plan
project is never paused for inactivity.

Nothing here is part of the application. Do not merge this branch into `main`.
