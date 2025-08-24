import { LinearGradient, vec } from "@shopify/react-native-skia";
import { View } from "react-native";
import { Pie, PolarChart } from "victory-native";

const VictoryNativePieChartV2 = () => {
  return (
    <View style={{ height: 300 }}>
      <PolarChart
        data={DATA()} // 👈 specify your data
        labelKey={"label"} // 👈 specify data key for labels
        valueKey={"value"} // 👈 specify data key for values
        colorKey={"color"} // 👈 specify data key for color
      >
        <Pie.Chart>
          {/* 👇 each individual slice */}
          {({ slice }) => {
            const { startX, startY, endX, endY } = calculateGradientPoints(
              slice.radius,
              slice.startAngle,
              slice.endAngle,
              slice.center.x,
              slice.center.y
            ); // 👈 create your own custom fn to calculate the gradient details (see example app)

            return (
              <>
                {/* 👇 return customized slice here  */}
                <Pie.Slice>
                  {/* 👇 configure slice label within Pie.Slice
                  <Pie.Label font={font} color={"white"} />
                */}
                  <LinearGradient
                    start={vec(startX, startY)}
                    end={vec(endX, endY)}
                    colors={[slice.color, `${slice.color}50`]}
                    positions={[0, 1]}
                  />
                </Pie.Slice>
                <Pie.SliceAngularInset
                  angularInset={{
                    angularStrokeWidth: 5,
                    angularStrokeColor: "white",
                  }}
                />
              </>
            );
          }}
        </Pie.Chart>
      </PolarChart>
    </View>
  );
};

export default VictoryNativePieChartV2;

function calculateGradientPoints(
  radius: number,
  startAngle: number,
  endAngle: number,
  centerX: number,
  centerY: number
) {
  // Calculate the midpoint angle of the slice for a central gradient effect
  const midAngle = (startAngle + endAngle) / 2;

  // Convert angles from degrees to radians
  const startRad = (Math.PI / 180) * startAngle;
  const midRad = (Math.PI / 180) * midAngle;

  // Calculate start point (inner edge near the pie's center)
  const startX = centerX + radius * 0.5 * Math.cos(startRad);
  const startY = centerY + radius * 0.5 * Math.sin(startRad);

  // Calculate end point (outer edge of the slice)
  const endX = centerX + radius * Math.cos(midRad);
  const endY = centerY + radius * Math.sin(midRad);

  return { startX, startY, endX, endY };
}

function randomNumber() {
  return Math.floor(Math.random() * 26) + 125;
}

function generateRandomColor(): string {
  // Generating a random number between 0 and 0xFFFFFF
  const randomColor = Math.floor(Math.random() * 0xffffff);
  // Converting the number to a hexadecimal string and padding with zeros
  return `#${randomColor.toString(16).padStart(6, "0")}`;
}

const DATA = (numberPoints = 5) =>
  Array.from({ length: numberPoints }, (_, index) => ({
    value: randomNumber(),
    color: generateRandomColor(),
    label: `Label ${index + 1}`,
  }));
