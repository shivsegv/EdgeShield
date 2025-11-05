import React, { useMemo } from 'react';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { formatRequestValue } from '../utils/format';

const NetworkMomentumCard = ({ timelineData, velocityStats }) => {
  const momentumDataset = useMemo(
    () =>
      timelineData.map((bucket) => ({
        label: bucket.label,
        allowed: bucket.allowed,
        blocked: bucket.blocked,
      })),
    [timelineData],
  );

  const hasMultiplePoints = momentumDataset.length > 1;

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '26px',
      }}
    >
      <CardContent sx={{ position: 'relative' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
          <Typography variant="h6">Network Momentum</Typography>
          <Chip
            size="small"
            label={timelineData.length ? `Last ${timelineData.length} mins` : 'Awaiting data'}
            sx={{
              background: 'rgba(129, 140, 248, 0.16)',
              color: '#c7d2fe',
              borderRadius: '12px',
            }}
          />
        </Stack>
        {timelineData.length ? (
          <Box sx={{ mt: 2 }}>
            <LineChart
              height={260}
              dataset={momentumDataset}
              xAxis={[{ dataKey: 'label', scaleType: 'point' }]}
              series={[
                {
                  id: 'allowed',
                  label: 'Allowed',
                  dataKey: 'allowed',
                  color: '#4ade80',
                  area: hasMultiplePoints,
                  showMark: !hasMultiplePoints,
                  valueFormatter: formatRequestValue,
                },
                {
                  id: 'blocked',
                  label: 'Blocked',
                  dataKey: 'blocked',
                  color: '#f97316',
                  area: hasMultiplePoints,
                  showMark: !hasMultiplePoints,
                  valueFormatter: formatRequestValue,
                },
              ]}
              slotProps={{
                legend: {
                  direction: 'row',
                  position: { vertical: 'top', horizontal: 'left' },
                },
              }}
              sx={{
                '& .MuiLineElement-root': { strokeWidth: 2.4 },
                '& .MuiAreaElement-root': { opacity: 0.12 },
                '& .MuiChartsLegend-root': { mb: 1 },
              }}
            />
          </Box>
        ) : (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Telemetry will render here as soon as events arrive.
            </Typography>
          </Box>
        )}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
          <Chip
            size="small"
            label={`Latest ${velocityStats.latest.toLocaleString()} / min`}
            sx={{
              borderRadius: '12px',
              background: 'rgba(74, 222, 128, 0.16)',
              color: '#bbf7d0',
            }}
          />
          <Chip
            size="small"
            label={`Average ${velocityStats.average.toLocaleString()} / min`}
            sx={{
              borderRadius: '12px',
              background: 'rgba(56, 189, 248, 0.14)',
              color: '#bae6fd',
            }}
          />
          <Chip
            size="small"
            label={`Peak ${velocityStats.peak.toLocaleString()} / min`}
            sx={{
              borderRadius: '12px',
              background: 'rgba(248, 113, 113, 0.16)',
              color: '#fecaca',
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default NetworkMomentumCard;
