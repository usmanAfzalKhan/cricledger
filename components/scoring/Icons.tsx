import { View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";

export const BatIcon = ({ size = 16 }: { size?: number }) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3 21l2 0 6.8-6.8c.4-.4.4-1 0-1.4L9.2 9.2c-.4-.4-1-.4-1.4 0L1 16v2l2 3z"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line x1="7" y1="7" x2="10" y2="10" stroke="currentColor" strokeWidth={2} />
    </Svg>
  </View>
);

export const BallIcon = ({ size = 16 }: { size?: number }) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth={2} />
      <Path d="M5 9c4 2 10 2 14 0" stroke="currentColor" strokeWidth={2} fill="none" />
      <Path d="M5 15c4-2 10-2 14 0" stroke="currentColor" strokeWidth={2} fill="none" />
    </Svg>
  </View>
);
