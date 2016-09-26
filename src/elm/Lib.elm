module Lib exposing (..)

matches : a -> b -> Bool
matches value constructor =
  case value of
    constructor ->
      True
    -- _ ->
    --   False
