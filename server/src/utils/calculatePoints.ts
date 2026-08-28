import { BASE_POINTS } from "../constants";

export const calculatePoints = ({
  timeLimitSec,
  questionStartTime,
  answeredAt,
}: {
  timeLimitSec: number;
  questionStartTime: number;
  answeredAt: number;
}) => {
  if (timeLimitSec <= 0) {
    return 0;
  }

  const elapsedSec = (answeredAt - questionStartTime) / 1000;
  const timeRemaining = Math.max(0, timeLimitSec - elapsedSec);

  return Math.round((BASE_POINTS * timeRemaining) / timeLimitSec);
};
