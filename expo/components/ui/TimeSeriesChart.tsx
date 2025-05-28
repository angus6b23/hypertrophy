import { Circle, useFont, Text as SkiaText, Rect, RoundedRect } from '@shopify/react-native-skia';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SharedValue, useDerivedValue } from 'react-native-reanimated';
import { Bar, CartesianChart, ChartPressState, Line, useChartPressState } from 'victory-native';
import { YAxisProps } from 'victory-native/dist/types';

import { Text } from './text';

import inter from '~/assets/fonts/inter.ttf';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { chartTimeframe, ChartTimeframe, useChartTimeFrame } from '~/utils/hooks/chart-timeframe';
import { filterByDate } from '~/utils/misc/filter-data';
import { roundNumbersMinMax } from '~/utils/misc/round-numbers';
import { useOptionStore } from '~/utils/stores/option-store';

interface TimeSeriesChartProps {
  data: any[];
  xKey: string;
  yOptions: {
    key: string;
    type: 'line' | 'bar';
    configDomain?: 5 | 10 | [number, number];
  }[];
}

export const TimeSeriesChart = (props: TimeSeriesChartProps) => {
  const { t } = useTranslation();
  const lang = useOptionStore((state) => state.language);
  const interFont = useFont(inter);

  const [timeframe, setTimeframe] = useChartTimeFrame();
  const [innerData, setInnerData] = useState<any[]>(props.data);
  useEffect(() => {
    setInnerData(
      filterByDate({
        data: props.data,
        duration: timeframe,
        dateKey: props.xKey,
      })
    );
  }, [timeframe]);

  const yAxisOption = useCallback(() => {
    return props.yOptions.map((item, i) => ({
      font: interFont,
      axisSide: i === 0 ? 'left' : 'right',
      yKeys: [item.key],
      domain: roundNumbersMinMax(
        props.data.map((innerData) => innerData[item.key]),
        5
      ),
      enableRescaling: true,
    }));
  }, [props.yOptions, innerData]);
  const yKeys = useCallback(() => props.yOptions.map((item) => item.key), [props.yOptions]);
  const initYPressState = useCallback(() => {
    const obj = {} as any;
    props.yOptions.forEach((item) => {
      obj[item.key] = innerData[0][item.key];
    });
    return obj;
  }, [innerData, props.yOptions]);

  const chartPressState = useChartPressState({
    x: innerData[0][props.xKey],
    y: initYPressState(),
  });

  const generateLabel = useCallback(
    (i: SharedValue<number>) => {
      const data = innerData[i.value];
      const xData = [
        {
          label: t('common.date'),
          value: new Date(chartPressState.state.x.value).toLocaleDateString(lang, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
          }),
        },
      ];
      return [
        ...xData,
        ...props.yOptions.map((item) => ({ label: t(`chart.${item.key}`), value: data[item.key] })),
      ];
    },
    [innerData, props.yOptions, chartPressState]
  );
  return (
    <>
      <View className="flex-1 justify-center">
        <Tabs
          className="w-full"
          value={timeframe as string}
          onValueChange={setTimeframe as (val: string) => void}>
          <TabsList className="w-full flex-row">
            {chartTimeframe.map((key: ChartTimeframe) => (
              <TabsTrigger key={key} value={key} className="flex-1">
                <Text>{t(`chart.${key}`)}</Text>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <View className="mt-2 h-[256]">
          <CartesianChart
            domainPadding={{ left: 50, right: 50, top: 20, bottom: 0 }}
            padding={{ bottom: 10, left: 20, right: 20 }}
            data={innerData}
            chartPressState={chartPressState.state}
            xKey={props.xKey}
            yKeys={yKeys()}
            xAxis={{
              font: interFont,
              formatXLabel: (label: string) =>
                label
                  ? new Date(label).toLocaleDateString(lang, {
                      year: '2-digit',
                      month: 'numeric',
                      day: 'numeric',
                    })
                  : '',
              labelPosition: 'outset',
              labelOffset: 0,
            }}
            yAxis={yAxisOption() as YAxisProps<any, string>[]}>
            {/* 👇 render function exposes various data, such as points. */}
            {({ points, chartBounds }) => (
              // 👇 and we'll use the Line component to render a line path.
              <>
                {props.yOptions.map((item) => {
                  return item.type === 'bar' ? (
                    <Bar
                      key={item.key}
                      points={points[item.key]}
                      chartBounds={chartBounds}
                      roundedCorners={{ topLeft: 10, topRight: 10 }}
                      barWidth={20}
                      animate={{ type: 'timing', duration: 300 }}
                      labels={{ position: 'right', font: null }}
                    />
                  ) : (
                    <Line
                      key={item.key}
                      points={points[item.key]}
                      curveType="natural"
                      connectMissingData
                      strokeWidth={3}
                      animate={{ type: 'timing', duration: 300 }}
                    />
                  );
                })}
                {chartPressState.isActive
                  ? props.yOptions.map((item) => (
                      <ToolTip
                        key={item.key}
                        x={chartPressState.state.x.position}
                        y={chartPressState.state['y'][item.key]['position']}
                      />
                    ))
                  : null}
                {chartPressState.isActive && (
                  <TextTooltip
                    state={chartPressState.state}
                    keys={props.yOptions.map((option) => option.key)}
                  />
                )}
              </>
              // <>
              //   <Bar
              //     points={points[props.yOptions[0].key]}
              //     chartBounds={chartBounds}
              //     color={colors.text}
              //     roundedCorners={{ topLeft: 10, topRight: 10 }}
              //     barWidth={20}
              //     animate={{ type: 'timing', duration: 300 }}
              //     labels={{ position: 'right', font: null }}
              //   />
              //   <Line
              //     points={points[props.yKeys[1]]}
              //     color=""
              //     curveType="natural"
              //     connectMissingData
              //     strokeWidth={3}
              //     animate={{ type: 'timing', duration: 300 }}
              //   />
              // </>
            )}
          </CartesianChart>
        </View>
      </View>
    </>
  );
};

// For i18next parser to pick up
// t('chart.14D');
// t('chart.30D');
// t('chart.3M');
// t('chart.6M');
// t('chart.1Y');
// t('chart.ALL');
function ToolTip({ x, y }: { x: SharedValue<number>; y: SharedValue<number> }) {
  return (
    <>
      <Circle cx={x} cy={y} r={4} color="white" />
    </>
  );
}

const TextTooltip = ({
  state,
  keys,
}: {
  state: ChartPressState<{ x: any; y: any }>;
  keys: string[];
}) => {
  const interFont = useFont(inter);
  const lang = useOptionStore((state) => state.language);

  const date = useDerivedValue(() => {
    return new Date(state.x.value.get()).toLocaleDateString(lang, {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  }, [state]);
  const xPosition = useDerivedValue(() => state.x.position.value - 40, [state]);
  const innerXPosition = useDerivedValue(() => state.x.position.value - 30, [state]);
  const generateText = (key: string) => `${key}: ${state.y[key].value.get()}`;
  // FIXME: Labels of text not syncing when drag

  useEffect(() => {}, [state.y.weight.value]);
  return (
    <>
      <RoundedRect
        x={xPosition}
        y={0}
        width={120}
        height={20 * (keys.length + 1) + 10}
        color="black"
        r={5}>
        <SkiaText x={innerXPosition} y={20} text={date} color="white" font={interFont} />
        {keys.map((key, i) => (
          <SkiaText
            key={key}
            x={innerXPosition}
            y={i * 20 + 40}
            text={generateText(key)}
            color="white"
            font={interFont}
          />
        ))}
      </RoundedRect>
    </>
  );
};
