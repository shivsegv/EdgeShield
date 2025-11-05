import React from 'react';
import { Avatar, Box, Card, CardContent, Stack, Typography } from '@mui/material';

const MetricCard = ({ icon: Icon, title, value, helper, accent }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: accent,
            color: '#0f172a',
            width: 52,
            height: 52,
            boxShadow: 3,
          }}
        >
          <Icon fontSize="medium" />
        </Avatar>
        <Box>
          <Typography variant="overline" sx={{ letterSpacing: 1.4 }}>
            {title}
          </Typography>
          <Typography variant="h4" component="p" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
          {helper && (
            <Typography variant="body2" color="text.secondary">
              {helper}
            </Typography>
          )}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

export default MetricCard;
