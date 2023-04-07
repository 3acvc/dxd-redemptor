import { Loader, LoaderWrapper } from "components/Loader";
import { PropsWithChildren } from "react";
import { Card, CardInnerWrapper } from "ui/components/Card";
import { MotionOpacity } from "./styled";

export const MotionMetricLoader = () => (
  <MotionOpacity>
    <LoaderWrapper>
      <Loader stroke="#fff" />
    </LoaderWrapper>
  </MotionOpacity>
);

export const MetricCard = ({ children }: PropsWithChildren) => (
  <Card $height="100%">
    <CardInnerWrapper>{children}</CardInnerWrapper>
  </Card>
);
