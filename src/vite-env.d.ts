/// <reference types="vite/client" />

declare module 'react-simple-maps' {
  import { ReactNode, CSSProperties, MouseEvent } from 'react'

  interface ComposableMapProps {
    projectionConfig?: Record<string, unknown>
    style?: CSSProperties
    children?: ReactNode
  }
  export function ComposableMap(props: ComposableMapProps): JSX.Element

  interface ZoomableGroupProps {
    zoom?: number
    center?: [number, number]
    minZoom?: number
    maxZoom?: number
    onMoveEnd?: (pos: { coordinates: [number, number]; zoom: number }) => void
    children?: ReactNode
  }
  export function ZoomableGroup(props: ZoomableGroupProps): JSX.Element

  interface GeographiesProps {
    geography: string | object
    children: (args: { geographies: GeoFeature[] }) => ReactNode
  }
  export function Geographies(props: GeographiesProps): JSX.Element

  interface GeoStyle {
    default?: CSSProperties
    hover?: CSSProperties
    pressed?: CSSProperties
  }

  interface GeoFeature {
    rsmKey: string
    properties: Record<string, string>
    [key: string]: unknown
  }

  interface GeographyProps {
    key?: string
    geography: GeoFeature
    style?: GeoStyle
    onMouseEnter?: (event: MouseEvent) => void
    onMouseLeave?: (event: MouseEvent) => void
    onClick?: (event: MouseEvent) => void
  }
  export function Geography(props: GeographyProps): JSX.Element
}
