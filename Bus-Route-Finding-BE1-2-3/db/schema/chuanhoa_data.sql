-- ========== INSERT STOPS ==========
INSERT INTO stops (stop_id, stop_name, stop_lat, stop_lon) VALUES
  ('S1', '01_1_S1', 21.048408, 105.878335),
  ('S2', '01_1_S10', 21.025799, 105.841261),
  ('S3', '01_1_S11', 21.023535, 105.841270),
  ('S4', '01_1_S12', 21.019377, 105.837823),
  ('S5', '01_1_S13', 21.019613, 105.833925),
  ('S6', '01_1_S14,02_1_S16', 21.016060, 105.828116),
  ('S7', '01_1_S15,02_1_S17', 21.011350, 105.825174),
  ('S8', '01_1_S16', 21.007383, 105.822975),
  ('S9', '01_1_S17', 21.000167, 105.815075),
  ('S10', '01_1_S18', 20.996184, 105.809091),
  ('S11', '01_1_S19', 20.993834, 105.805641),
  ('S12', '01_1_S2', 21.049949, 105.883307),
  ('S13', '01_1_S20', 20.990717, 105.801225),
  ('S14', '01_1_S21', 20.988413, 105.798049),
  ('S15', '01_1_S22', 20.986134, 105.794823),
  ('S16', '01_1_S23', 20.983697, 105.791504),
  ('S17', '01_1_S24', 20.980652, 105.787742),
  ('S18', '01_1_S25', 20.979526, 105.786296),
  ('S19', '01_1_S26', 20.975734, 105.781392),
  ('S20', '01_1_S27', 20.972782, 105.777367),
  ('S21', '01_1_S28', 20.969769, 105.773702),
  ('S22', '01_1_S29', 20.967801, 105.771226),
  ('S23', '01_1_S3', 21.045799, 105.875123),
  ('S24', '01_1_S30', 20.965034, 105.767626),
  ('S25', '01_1_S31', 20.962284, 105.764126),
  ('S26', '01_1_S32', 20.960421, 105.761730),
  ('S27', '01_1_S33', 20.958336, 105.759022),
  ('S28', '01_1_S34,02_1_S36', 20.954324, 105.753744),
  ('S29', '01_1_S35', 20.952318, 105.751059),
  ('S30', '01_1_S36,01_2_S1', 20.950059, 105.747245),
  ('S31', '03A_1_S9', 21.023583, 105.843891),
  ('S32', '03B_1_S3', 20.980751, 105.841357)
ON CONFLICT (stop_id) DO UPDATE SET
  stop_name = EXCLUDED.stop_name,
  stop_lat = EXCLUDED.stop_lat,
  stop_lon = EXCLUDED.stop_lon;

-- ========== UPDATE ROUTE_STOPS ==========
UPDATE route_stops SET stop_id = 'S1' WHERE route_id = '01_1' AND stop_id = '01_1_S1';
UPDATE route_stops SET stop_id = 'S2' WHERE route_id = '01_1' AND stop_id = '01_1_S10';
UPDATE route_stops SET stop_id = 'S3' WHERE route_id = '01_1' AND stop_id = '01_1_S11';
UPDATE route_stops SET stop_id = 'S4' WHERE route_id = '01_1' AND stop_id = '01_1_S12';
UPDATE route_stops SET stop_id = 'S5' WHERE route_id = '01_1' AND stop_id = '01_1_S13';
UPDATE route_stops SET stop_id = 'S6' WHERE route_id = '01_1' AND stop_id = '01_1_S14';
UPDATE route_stops SET stop_id = 'S7' WHERE route_id = '01_1' AND stop_id = '01_1_S15';
UPDATE route_stops SET stop_id = 'S8' WHERE route_id = '01_1' AND stop_id = '01_1_S16';
UPDATE route_stops SET stop_id = 'S9' WHERE route_id = '01_1' AND stop_id = '01_1_S17';
UPDATE route_stops SET stop_id = 'S10' WHERE route_id = '01_1' AND stop_id = '01_1_S18';
UPDATE route_stops SET stop_id = 'S11' WHERE route_id = '01_1' AND stop_id = '01_1_S19';
UPDATE route_stops SET stop_id = 'S12' WHERE route_id = '01_1' AND stop_id = '01_1_S2';
UPDATE route_stops SET stop_id = 'S13' WHERE route_id = '01_1' AND stop_id = '01_1_S20';
UPDATE route_stops SET stop_id = 'S14' WHERE route_id = '01_1' AND stop_id = '01_1_S21';
UPDATE route_stops SET stop_id = 'S15' WHERE route_id = '01_1' AND stop_id = '01_1_S22';
UPDATE route_stops SET stop_id = 'S16' WHERE route_id = '01_1' AND stop_id = '01_1_S23';
UPDATE route_stops SET stop_id = 'S17' WHERE route_id = '01_1' AND stop_id = '01_1_S24';
UPDATE route_stops SET stop_id = 'S18' WHERE route_id = '01_1' AND stop_id = '01_1_S25';
UPDATE route_stops SET stop_id = 'S19' WHERE route_id = '01_1' AND stop_id = '01_1_S26';
UPDATE route_stops SET stop_id = 'S20' WHERE route_id = '01_1' AND stop_id = '01_1_S27';
UPDATE route_stops SET stop_id = 'S21' WHERE route_id = '01_1' AND stop_id = '01_1_S28';
UPDATE route_stops SET stop_id = 'S22' WHERE route_id = '01_1' AND stop_id = '01_1_S29';
UPDATE route_stops SET stop_id = 'S23' WHERE route_id = '01_1' AND stop_id = '01_1_S3';
UPDATE route_stops SET stop_id = 'S24' WHERE route_id = '01_1' AND stop_id = '01_1_S30';
UPDATE route_stops SET stop_id = 'S25' WHERE route_id = '01_1' AND stop_id = '01_1_S31';
UPDATE route_stops SET stop_id = 'S26' WHERE route_id = '01_1' AND stop_id = '01_1_S32';
UPDATE route_stops SET stop_id = 'S27' WHERE route_id = '01_1' AND stop_id = '01_1_S33';
UPDATE route_stops SET stop_id = 'S28' WHERE route_id = '01_1' AND stop_id = '01_1_S34';
UPDATE route_stops SET stop_id = 'S29' WHERE route_id = '01_1' AND stop_id = '01_1_S35';
UPDATE route_stops SET stop_id = 'S30' WHERE route_id = '01_1' AND stop_id = '01_1_S36';
UPDATE route_stops SET stop_id = 'S30' WHERE route_id = '01_2' AND stop_id = '01_2_S1';
UPDATE route_stops SET stop_id = 'S6' WHERE route_id = '02_1' AND stop_id = '02_1_S16';
UPDATE route_stops SET stop_id = 'S7' WHERE route_id = '02_1' AND stop_id = '02_1_S17';
UPDATE route_stops SET stop_id = 'S28' WHERE route_id = '02_1' AND stop_id = '02_1_S36';
UPDATE route_stops SET stop_id = 'S31' WHERE route_id = '03A_1' AND stop_id = '03A_1_S9';
UPDATE route_stops SET stop_id = 'S32' WHERE route_id = '03B_1' AND stop_id = '03B_1_S3';

-- ========== KIỂM TRA KẾT QUẢ ==========
SELECT stop_id, route_id, COUNT(*) as n FROM route_stops GROUP BY stop_id, route_id ORDER BY stop_id;

SELECT stop_id, COUNT(DISTINCT route_id) as routes FROM route_stops GROUP BY stop_id HAVING COUNT(DISTINCT route_id) > 1 ORDER BY routes DESC;
