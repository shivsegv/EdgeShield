import React from 'react';
import { Avatar, Box, Stack, Typography } from '@mui/material';

const InsightRow = ({ icon: Icon, label, value, helper }) => (
  <Stack
    direction="row"
    spacing={2}
    alignItems="center"
    sx={{
      px: 2.2,
      py: 1.6,
      borderRadius: '16px',
      border: '1px solid rgba(148, 163, 184, 0.18)',
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.75) 100%)',
    }}
  >
    <Avatar
      variant="rounded"
      sx={{
        width: 40,
        height: 40,
        bgcolor: 'rgba(99, 102, 241, 0.12)',
        color: '#a5b4fc',
      }}
    >
      <Icon fontSize="small" />
    </Avatar>
    <Box>
      <Typography variant="overline" sx={{ letterSpacing: 1.3, color: 'rgba(226, 232, 240, 0.55)' }}>
        {label}
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
      {helper && (
        <Typography variant="body2" color="text.secondary">
          {helper}
        </Typography>
      )}
    </Box>
  </Stack>
);

export default InsightRow;
