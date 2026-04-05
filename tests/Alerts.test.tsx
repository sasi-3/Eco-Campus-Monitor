import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Alerts from '../components/Alerts';

describe('Alerts Component', () => {
  const mockAlerts = [
    {
      id: "1",
      timestamp: new Date().toISOString(),
      severity: "CRITICAL" as const,
      message: "Test critical alert message",
      location: "Main Library",
      sensorType: "TEMPERATURE" as const,
    }
  ];

  it('renders the alert center header', () => {
    render(<Alerts alerts={mockAlerts} onClearAll={() => {}} />);
    expect(screen.getByText('Alert Center')).toBeDefined();
    expect(screen.getByText('Monitor critical environmental incidents and sensor health')).toBeDefined();
  });

  it('renders alert cards based on props', () => {
    render(<Alerts alerts={mockAlerts} onClearAll={() => {}} />);
    expect(screen.getByText('Test critical alert message')).toBeDefined();
    expect(screen.getByText('Main Library')).toBeDefined();
  });

  it('calls onClearAll when the clear button is clicked', () => {
    let cleared = false;
    render(<Alerts alerts={mockAlerts} onClearAll={() => { cleared = true; }} />);
    
    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);
    expect(cleared).toBe(true);
  });
});
