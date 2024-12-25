let upstream = https://github.com/dfinity/vessel-package-set/releases/download/mo-0.13.5-20241206/package-set.dhall sha256:1697706e888f5bcdb7681aedd002d2d59c102049794654a6af8b3815bc15fb97
let Package =
    { name : Text, version : Text, repo : Text, dependencies : List Text }

let
  -- This is where you can add your own packages to the package-set
  additions =
    [] : List Package

let
  {- This is where you can override existing packages in the package-set

     For example, if you wanted to use version `v2.0.0` of the foo library:
     let overrides = [
         { name = "foo"
         , version = "v2.0.0"
         , repo = "https://github.com/bar/foo"
         , dependencies = [] : List Text
         },
         { name = "base"
         , repo = "https://github.com/dfinity/motoko-base"
         , version = "latest"
         }
     ]
  -}
  overrides =
    [] : List Package

in  upstream # additions # overrides
