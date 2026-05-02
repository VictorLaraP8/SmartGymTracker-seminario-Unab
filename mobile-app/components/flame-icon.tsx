import Svg, { Path } from 'react-native-svg';

type FlameIconProps = {
  size?: number;
  color?: string;
};

/**
 * Llama en SVG (sin fuentes de iconos) para evitar el «?» en cuadro en Android.
 * Trazo adaptado de Bootstrap Icons «fire» (viewBox 16×16, escala con size).
 */
export function FlameIcon({ size = 22, color = '#facc15' }: FlameIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      accessibilityLabel="Llama"
      accessibilityRole="image"
    >
      <Path
        fill={color}
        fillRule="evenodd"
        d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6.5 1.5 1.5 4 4 4 6.5 0 3-2 5-6 5zm0 1c3.866 0 7-2.686 7-6 0-2.566-.867-4.804-2.598-6.694A1 1 0 0 0 12 4c-.253 0-.5.047-.732.14C9.18 4.693 8 6.29 8 8c0 2.21 1.79 4 4 4s4-1.79 4-4c0-1.71-.693-3.18-1.732-4.14A1 1 0 0 0 12 2c-3.866 0-7 2.686-7 6 0 3.314 2.686 6 7 6z"
      />
    </Svg>
  );
}
