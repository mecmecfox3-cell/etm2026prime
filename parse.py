import re

data = """Vidéo 2 (Ex-Vidéo 25)
Q1 : 00:34 - 00:56 ➔ B
Q2 : 01:21 - 01:55 ➔ A, C
Q3 : 02:35 - 03:13 ➔ A, C, D
Q4 : 03:57 - 04:39 ➔ A, C
Q5 : 05:19 - 05:53 ➔ A, B, C
Q6 : 06:25 - 06:54 ➔ A
Q7 : 07:24 - 07:58 ➔ A, D
Q8 : 08:46 - 09:19 ➔ A, C
Q9 : 09:56 - 10:35 ➔ A, D
Q10 : 11:11 - 11:32 ➔ A, D
Q11 : 12:27 - 12:58 ➔ A, D
Q12 : 13:38 - 14:18 ➔ A, C
Q13 : 14:48 - 15:16 ➔ B
Q14 : 15:39 - 16:09 ➔ B, C
Q15 : 16:49 - 17:07 ➔ A, C
Q16 : 17:55 - 18:30 ➔ A, C, D
Q17 : 18:58 - 19:27 ➔ B
Q18 : 20:10 - 20:35 ➔ A
Q19 : 21:08 - 21:37 ➔ A
Q20 : 21:55 - 22:20 ➔ B
Q21 : 22:48 - 23:21 ➔ A, D
Q22 : 24:23 - 24:59 ➔ A, B
Q23 : 25:24 - 25:50 ➔ B
Q24 : 26:05 - 26:36 ➔ C
Q25 : 27:05 - 27:32 ➔ A, D
Q26 : 28:18 - 28:51 ➔ B
Q27 : 29:16 - 29:42 ➔ A
Q28 : 30:10 - 30:45 ➔ A, C
Q29 : 31:35 - 32:16 ➔ A, C
Q30 : 32:46 - 33:10 ➔ A
Q31 : 33:42 - 34:18 ➔ A, C
Q32 : 34:50 - 35:21 ➔ A
Q33 : 35:42 - 36:14 ➔ A, D
Q34 : 36:42 - 37:08 ➔ B
Q35 : 37:49 - 38:29 ➔ A
Q36 : 38:55 - 39:28 ➔ B, D
Q37 : 40:12 - 40:54 ➔ A, C
Q38 : 41:20 - 41:48 ➔ B
Q39 : 42:15 - 42:51 ➔ A, C
Q40 : 43:10 - 43:35 ➔ A

Vidéo 3 (Ex-Vidéo 24)
Q1 : 00:34 - 01:07 ➔ A, C
Q2 : 01:38 - 02:14 ➔ A, D
Q3 : 02:38 - 03:12 ➔ A, C
Q4 : 04:10 - 04:54 ➔ B
Q5 : 05:11 - 05:39 ➔ A, C
Q6 : 05:57 - 06:30 ➔ A, D
Q7 : 07:14 - 07:45 ➔ A, C
Q8 : 08:31 - 08:54 ➔ A
Q9 : 09:22 - 09:55 ➔ B
Q10 : 10:28 - 10:49 ➔ B
Q11 : 11:28 - 12:09 ➔ A, D
Q12 : 12:34 - 13:05 ➔ A, C
Q13 : 13:47 - 14:18 ➔ B
Q14 : 14:49 - 15:19 ➔ A, C
Q15 : 15:55 - 16:32 ➔ C
Q16 : 17:05 - 17:33 ➔ A, C
Q17 : 18:08 - 18:33 ➔ B
Q18 : 19:24 - 20:09 ➔ B, D
Q19 : 20:28 - 20:53 ➔ C
Q20 : 21:34 - 22:03 ➔ B
Q21 : 22:18 - 22:48 ➔ A
Q22 : 23:28 - 24:02 ➔ A
Q23 : 24:35 - 25:05 ➔ A, D
Q24 : 25:51 - 26:14 ➔ B
Q25 : 26:41 - 27:12 ➔ A, C
Q26 : 27:35 - 28:05 ➔ A, C
Q27 : 28:36 - 28:55 ➔ B
Q28 : 29:39 - 30:17 ➔ A
Q29 : 30:48 - 31:25 ➔ A, C, D
Q30 : 31:48 - 32:24 ➔ B
Q31 : 32:54 - 33:24 ➔ B
Q32 : 33:47 - 34:07 ➔ A
Q33 : 34:32 - 35:09 ➔ A, B, C
Q34 : 35:45 - 36:16 ➔ A, B, D
Q35 : 37:01 - 37:36 ➔ B, C
Q36 : 38:00 - 38:27 ➔ B
Q37 : 39:08 - 39:42 ➔ B
Q38 : 40:14 - 40:47 ➔ B
Q39 : 41:09 - 41:33 ➔ A
Q40 : 41:56 - 42:28 ➔ A, B, C

Vidéo 4 (Ex-Vidéo 23)
Q1 : 00:35 - 01:08 ➔ A
Q2 : 01:35 - 02:07 ➔ B, C, D
Q3 : 02:32 - 03:04 ➔ A, C
Q4 : 03:50 - 04:35 ➔ B, C
Q5 : 05:07 - 05:29 ➔ A
Q6 : 05:54 - 06:25 ➔ B, D
Q7 : 07:11 - 07:54 ➔ B, C
Q8 : 08:38 - 09:02 ➔ A
Q9 : 09:57 - 10:36 ➔ A, D
Q10 : 11:01 - 11:38 ➔ A, C
Q11 : 11:53 - 12:27 ➔ A, C
Q12 : 12:54 - 13:30 ➔ C
Q13 : 14:08 - 14:45 ➔ A
Q14 : 15:07 - 15:36 ➔ A
Q15 : 16:18 - 17:10 ➔ A, C
Q16 : 17:46 - 18:20 ➔ A, C
Q17 : 18:57 - 19:29 ➔ A, D
Q18 : 20:02 - 20:25 ➔ B
Q19 : 20:53 - 21:25 ➔ A, C
Q20 : 22:15 - 22:45 ➔ A
Q21 : 23:25 - 23:45 ➔ A
Q22 : 24:10 - 24:44 ➔ C
Q23 : 25:15 - 25:48 ➔ A, D
Q24 : 26:06 - 26:29 ➔ B
Q25 : 26:52 - 27:24 ➔ A, C
Q26 : 27:58 - 28:28 ➔ A
Q27 : 29:06 - 29:30 ➔ A
Q28 : 30:09 - 30:53 ➔ A, C
Q29 : 31:42 - 32:08 ➔ A
Q30 : 32:32 - 32:56 ➔ A
Q31 : 33:26 - 33:50 ➔ B
Q32 : 34:45 - 35:26 ➔ A
Q33 : 36:18 - 36:52 ➔ A, D
Q34 : 37:27 - 37:56 ➔ B, C
Q35 : 38:18 - 38:46 ➔ B
Q36 : 39:17 - 39:49 ➔ B
Q37 : 40:02 - 40:33 ➔ A, C
Q38 : 41:13 - 41:53 ➔ A, D
Q39 : 42:18 - 42:50 ➔ A, B, D
Q40 : 43:31 - 43:59 ➔ A, C

Vidéo 5 (Ex-Vidéo 22)
Q1 : 00:34 - 01:04 ➔ C
Q2 : 01:44 - 02:24 ➔ A, C
Q3 : 03:07 - 03:28 ➔ A
Q4 : 04:14 - 04:51 ➔ A
Q5 : 05:22 - 05:52 ➔ A, C
Q6 : 06:25 - 06:49 ➔ B
Q7 : 07:17 - 07:40 ➔ A
Q8 : 08:15 - 08:38 ➔ B
Q9 : 09:12 - 09:42 ➔ A
Q10 : 10:20 - 10:45 ➔ A, B, D
Q11 : 11:42 - 12:11 ➔ A, C
Q12 : 12:36 - 13:03 ➔ A, C
Q13 : 13:46 - 14:26 ➔ A, C
Q14 : 15:02 - 15:26 ➔ C
Q15 : 16:00 - 16:23 ➔ B
Q16 : 16:42 - 17:12 ➔ A
Q17 : 17:58 - 18:27 ➔ A, B, C
Q18 : 18:52 - 19:21 ➔ C
Q19 : 19:48 - 20:17 ➔ A
Q20 : 20:43 - 21:05 ➔ A
Q21 : 21:41 - 22:08 ➔ B, C
Q22 : 23:09 - 23:45 ➔ A
Q23 : 24:10 - 24:38 ➔ A, D
Q24 : 25:28 - 25:49 ➔ B, D
Q25 : 26:34 - 27:16 ➔ B, D
Q26 : 27:52 - 28:21 ➔ B
Q27 : 28:44 - 29:16 ➔ A, C
Q28 : 29:51 - 30:31 ➔ C
Q29 : 31:05 - 31:31 ➔ A, D
Q30 : 32:10 - 32:40 ➔ B, C
Q31 : 33:16 - 33:55 ➔ A, C
Q32 : 34:23 - 34:47 ➔ B
Q33 : 35:28 - 35:47 ➔ A
Q34 : 36:17 - 36:46 ➔ C
Q35 : 37:29 - 37:52 ➔ A, C
Q36 : 38:31 - 39:04 ➔ B
Q37 : 39:41 - 40:09 ➔ B
Q38 : 40:56 - 41:19 ➔ A
Q39 : 41:55 - 42:21 ➔ A
Q40 : 42:55 - 43:27 ➔ B, C

Vidéo 6 (Ex-Vidéo 21)
Q1 : 00:35 - 01:06 ➔ A, C
Q2 : 01:37 - 02:07 ➔ B, C
Q3 : 02:42 - 03:21 ➔ B, C
Q4 : 03:47 - 04:12 ➔ A
Q5 : 04:47 - 05:17 ➔ A, C
Q6 : 05:49 - 06:17 ➔ A
Q7 : 06:41 - 07:16 ➔ A, B, D
Q8 : 08:10 - 08:47 ➔ B, D
Q9 : 09:11 - 09:43 ➔ A, C
Q10 : 10:08 - 10:32 ➔ A
Q11 : 11:05 - 11:35 ➔ A, C
Q12 : 12:13 - 12:45 ➔ A, C, D
Q13 : 13:21 - 14:04 ➔ A, C
Q14 : 14:38 - 15:10 ➔ A, C
Q15 : 15:46 - 16:11 ➔ B
Q16 : 16:55 - 17:35 ➔ A, C
Q17 : 17:59 - 18:24 ➔ A
Q18 : 18:59 - 19:23 ➔ B
Q19 : 19:37 - 20:10 ➔ B, D
Q20 : 20:53 - 21:17 ➔ A
Q21 : 21:49 - 22:26 ➔ A, D
Q22 : 23:05 - 23:41 ➔ B, D
Q23 : 24:09 - 24:43 ➔ A, C
Q24 : 25:32 - 26:14 ➔ A, C
Q25 : 26:48 - 27:21 ➔ B, C
Q26 : 27:54 - 28:23 ➔ B, C
Q27 : 28:59 - 29:37 ➔ A, D
Q28 : 30:22 - 30:55 ➔ A, B, C
Q29 : 31:18 - 31:45 ➔ A
Q30 : 32:17 - 32:43 ➔ C
Q31 : 33:36 - 34:06 ➔ A
Q32 : 34:34 - 35:09 ➔ A, C
Q33 : 35:49 - 36:16 ➔ A
Q34 : 36:55 - 37:28 ➔ A
Q35 : 37:46 - 38:17 ➔ A, C
Q36 : 38:52 - 39:24 ➔ A, C
Q37 : 40:05 - 40:38 ➔ B
Q38 : 41:15 - 41:52 ➔ A, B, C
Q39 : 42:38 - 43:08 ➔ A, C
Q40 : 43:35 - 44:05 ➔ B, C
"""

def time_to_seconds(t):
    m, s = map(int, t.split(':'))
    return m * 60 + s

# Split sections only when "Vidéo" is at the start of a line
sections = re.split(r'\n(?=Vidéo )', data.strip())
# Handle the first section which might not have a preceding newline in data.strip()
if sections and not sections[0].startswith('Vidéo '):
    # This shouldn't happen with strip() and the regex above, but let's be safe
    pass

output = []
for section in sections:
    if not section.strip(): continue
    lines = section.strip().split('\n')
    header = lines[0] # e.g. "Vidéo 2 (Ex-Vidéo 25)"
    num_match = re.search(r'Vidéo (\d+)', header)
    if not num_match: continue
    num = num_match.group(1)
    
    raw_qs = []
    for line in lines[1:]:
        if not line.strip(): continue
        match = re.search(r'Q\d+ : ([\d:]+) - ([\d:]+) (?:\u2794|->) (.+)', line)
        if match:
            raw_qs.append({
                'start': time_to_seconds(match.group(1)),
                'original_end': time_to_seconds(match.group(2)),
                'ans': match.group(3).strip()
            })
    
    qs = []
    for i in range(len(raw_qs)):
        q = raw_qs[i]
        start = q['start']
        expStart = start + 25 # Previous 15 + new 10
        
        # New rule: end of explanation is start of next question - 1s
        if i < len(raw_qs) - 1:
            end = raw_qs[i+1]['start'] - 1
        else:
            end = q['original_end']
            
        qs.append(f'[{start}, {expStart}, {end}, "{q["ans"]}"]')
    
    out_str = f'  "serie{num}": {{\n    "title": "S\u00e9rie {num}", "videoFile": "video{num}.mp4",\n    "questions": [\n'
    for i in range(0, len(qs), 5):
        line_qs = ', '.join(qs[i:i+5])
        out_str += f'      {line_qs}' + (',' if i+5 < len(qs) else '') + '\n'
    out_str += '    ]\n  }'
    output.append(out_str)

print(",\n".join(output))
