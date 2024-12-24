let Package =
      https://github.com/dfinity/vessel-package-set/releases/latest/download/package.dhall sha256:42836a8a0b9ee4d9e6b0704e6a8403dfd732d77e798a1b249f2f011ee19fa899

in    Package
      with additions =
        toMap
          { base =
              { repo = "https://github.com/dfinity/motoko-base"
              , version = "latest"
              }
          , matchers =
              { repo = "https://github.com/dfinity/motoko-matchers"
              , version = "latest"
              }
          , ref =
              { repo = "https://github.com/dfinity/motoko-ref"
              , version = "latest"
              }
          , collections =
              { repo = "https://github.com/dfinity/motoko-collections"
              , version = "latest"
              }
          }
