import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/Navbar';
import { GameProvider } from '@/contexts/GameContext';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { LeaderboardProvider } from '@/contexts/LeaderboardContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HR Games',
  description: 'HR Training Games',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <GameProvider>
            <PlayerProvider>
              <LeaderboardProvider>
                <Navbar />
                {children}
              </LeaderboardProvider>
            </PlayerProvider>
          </GameProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


import './globals.css'