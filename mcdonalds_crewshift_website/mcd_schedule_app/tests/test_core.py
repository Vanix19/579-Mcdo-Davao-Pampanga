import unittest
from datetime import date
from app import app, conn, init_db, duration, parse_import_date, parse_import_time
class ScheduleTests(unittest.TestCase):
    def test_hours(self):
        self.assertEqual(duration('09:00','17:00',30),7.5)
        self.assertEqual(duration('22:00','06:00',60),7.0)
    def test_dates(self):
        self.assertEqual(parse_import_date('2026-10-15'),'2026-10-15')
        self.assertEqual(parse_import_time('9:00 PM'),'21:00')
    def test_unauthorized_redirect(self):
        with app.test_client() as client:
            self.assertEqual(client.get('/schedule').status_code,302)
if __name__=='__main__': unittest.main()
