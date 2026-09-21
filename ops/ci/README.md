# ops/ci — GitHub TEST for the Open Memory Format

```
AI → PR → TEST → MERGE → TEST merged SHA
```

| Command | Runs on | Holds |
| --- | --- | --- |
| `ops/ci/test` | GitHub-hosted `ubuntu-24.04` (`ci.yml`, job `quality`) | nothing |

- TEST runs the conformance suite (`conformance/cases.json`) against the stdlib-only Python
  reference reader (`reference/run-conformance.py`). It is a public specification with no
  build, dependencies, secrets or deployment, so there is no DEPLOY stage.
- **Merge enforcement:** the `Protect main` ruleset requires a pull request and the
  `quality` check.
