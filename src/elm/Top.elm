port module Top exposing (Model, Msg, init, update, view)


import Task

import Html exposing
  -- delete what you don't need
  ( Html, div, span, img, p, a, h1, h2, h3, h4, h5, h6, h6, text
  , ol, ul, li, dl, dt, dd
  , form, input, textarea, button, select, option
  , table, caption, tbody, thead, tr, td, th
  , em, strong, blockquote, hr
  )
import Html.Attributes exposing
  ( style, class, id, title, hidden, type', checked, placeholder, selected
  , name, href, src, alt
  )
import Html.Events exposing
  ( on, targetValue, targetChecked, keyCode, onBlur, onFocus, onSubmit
  , onClick, onDoubleClick
  , onMouseDown, onMouseUp, onMouseEnter, onMouseLeave, onMouseOver, onMouseOut
  )

import Svg exposing (circle, svg, line)
import Svg.Attributes exposing (cx, cy, r, viewBox, width, height, x1, y1, x2, y2)
import Svg.Events

import VirtualDom

-- import Json.Decode as Decode

import Json.Decode as Json exposing ((:=))

import DOM exposing (target, offsetWidth, offsetLeft)


-- MODEL

type alias Point3D =
  { x : Float
  , y : Float
  , z : Float
  }

type alias Vector3D = Point3D

type alias ListenerOrientation3D = (Point3D, Point3D)

type alias Model =
  { listenerOrientationDegrees : Float
  , soundObjectLocation : Point3D
  }

init : (Model, Cmd Msg)
init =
  { listenerOrientationDegrees = 0.0
  , soundObjectLocation = { x = 0.0, y = 0.0, z = -5.0 }
  }
  !
  [ ]

listenerLookingTowardsHorizonVector : Vector3D
listenerLookingTowardsHorizonVector = { x = 0.0, y = 1.0, z= 0.0 }

listenerOrientationTo3D : Float -> ListenerOrientation3D
listenerOrientationTo3D angleDegrees =
  let
    angleRadians = degrees (90.0 - angleDegrees)-- because "forward" is towards z
    -- _ = Debug.log "angleRadians" angleRadians
  in
    ( { x = cos angleRadians
      , y = 0.0
      , z = sin angleRadians
      }
    , listenerLookingTowardsHorizonVector
    )


radiansToDegrees angleRadians =
  angleRadians * ( 180.0 / pi)

-- UPDATE

type Msg
  = NoOp
  | ListenerOrientation Float
  | ClickCompass Position

update : Msg -> Model -> (Model, Cmd Msg)
update action model =
  -- case Debug.log "action" action of
  case action of
    ListenerOrientation degrees ->
      let
        orientation3D = listenerOrientationTo3D degrees
        cmd = setListenerOrientation orientation3D
      in
        { model | listenerOrientationDegrees = degrees }
        ! [ cmd ]

    NoOp ->
      model ! []

    ClickCompass pos ->
      let
        translateX x =
          (toFloat x - 200) / 200.0
        translateY y =
          (toFloat y - 200) / 200.0
        normX = translateX pos.x
        normY = translateY pos.y
        angleRads = atan (normY / normX)
        angleRads' =
          if (normX > 0 && normY > 0)
          then
            angleRads
          else
            if (normX < 0 && normY > 0)
            then
              angleRads + pi
            else
              if (normX < 0 && normY < 0)
              then
                angleRads+ pi
              else
                angleRads + (2.0 * pi)


        angleRads'' = angleRads' + (pi / 2.0)
        angleRads''' = if angleRads'' > (2 * pi) then angleRads'' - (2 * pi) else angleRads''
        angleDegrees = radiansToDegrees angleRads'''
        -- angleDegrees'' = angleDegrees' + 90.0

        orientation3D = listenerOrientationTo3D angleDegrees
        cmd = setListenerOrientation orientation3D


        -- _ = Debug.log "-------------" True
        -- _ = Debug.log "normX" normX
        -- _ = Debug.log "normY" normY
        -- _ = Debug.log "angleRads" angleRads
        -- _ = Debug.log "angleDegrees" angleDegrees
      in
        { model | listenerOrientationDegrees = angleDegrees }
        ! [ cmd ]

-- VIEW


view : Model -> Html Msg
view model =
  div
    []
    [ div []
      [ text <| "Orientation: " ++ toString model.listenerOrientationDegrees
      ]
    , div []
      [ setOrientationButton 0.0
      , setOrientationButton 90.0
      , setOrientationButton 180.0
      , setOrientationButton 270.0
      ]
    , div
      [ id "compass-box"
      ]
      [ svg
        [ id "circle"
        , width "400px"
        , height "400px"
        , viewBox "0 0 2 2"
        , VirtualDom.onWithOptions "mousemove" options (Json.map ClickCompass offsetPosition)
        ]
        [ circle
          [ cx "1"
          , cy "1"
          , r "1"
          ]
          []
        , compassArrow (model.listenerOrientationDegrees - 90.0)
        ]
      ]
    ]

type alias Position =
    { x : Int, y : Int }

offsetPosition : Json.Decoder Position
offsetPosition =
    Json.object2 Position ("offsetX" := Json.int) ("offsetY" := Json.int)

setOrientationButton degrees =
  button
    [ onClick <| ListenerOrientation degrees ]
    [ text <| "set orientation to " ++ (toString degrees) ]

options =
    { preventDefault = True, stopPropagation = True }

compassArrow angleDegrees =
  let
    centerX = "1"
    centerY = "1"
    xNorm = angleDegrees |> degrees |> cos
    yNorm = angleDegrees |> degrees |> sin
    xActual = xNorm + 1 |> toString
    yActual = yNorm + 1 |> toString

    -- if y = 0, then y = 1
    -- if x = 1 then x = 2
    -- if x = 0 then x = 1
    --
    -- _ = Debug.log "xNorm" xNorm
    -- _ = Debug.log "yNorm" yNorm
  in
    line
      [ id "compass-line",  x1 centerX, y1 centerY, x2 xActual, y2 yActual ] []

-- PORTS

port setListenerOrientation
  : ListenerOrientation3D -> Cmd msg
