let Prelude = https://github.com/dfinity/vessel/releases/latest/download/vessel.dhall sha256:3fdb9fa88fa8fbd2a631f1bfe7b1cfd7312f59efb2de8a9b3152f16b2e24d274

in Prelude.default
  with dependencies =
    [ { name = "base"
      , repo = "https://github.com/dfinity/motoko-base"
      , version = "latest"
      }
    ]
  , compiler = Some "dfx"
