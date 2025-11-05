import React from 'react';
import { Box, Card, CardContent, Chip, Fade, Stack, Typography } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

const TrafficSplitCard = ({ chartData, allowRate, totals }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Traffic Split</Typography>
        <Chip
          size="small"
          label={`Allow rate ${allowRate}%`}
          sx={{
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.16)',
            color: '#bfdbfe',
          }}
        />
      </Stack>
      <Fade in timeout={600}>
        <Box>
          <PieChart
            series={[
              {
                data: chartData,
                innerRadius: 45,
                outerRadius: 120,
                paddingAngle: 3,
                cornerRadius: 6,
              },
            ]}
            height={280}
            slotProps={{
              legend: {
                hidden: false,
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'middle' },
              },
            }}
          />
        </Box>
      </Fade>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ mt: 3 }}>
        <Chip
          size="small"
          label={`Allowed ${totals.allowed.toLocaleString()}`}
          sx={{
            borderRadius: '12px',
            background: 'rgba(74, 222, 128, 0.16)',
            color: '#bbf7d0',
          }}
        />
        <Chip
          size="small"
          label={`Blocked ${totals.blocked.toLocaleString()}`}
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

export default TrafficSplitCard;
