import os
os.environ["oe_bypass_sentiment"] = "1"

import sys
import json
import tempfile
import requests
from objection_engine.renderer import render_comment_list
from objection_engine.beans.comment import Comment

# reads JSON output from Typescript piped into script as single string, parsing it into a Python list of key-value pairs
data = json.loads(sys.stdin.read())
comments = []
temp_files = []

for p in data:
    evidence_path = None
    if p.get("imageUrl"):
        response = requests.get(p["imageUrl"])
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
        tmp.write(response.content)
        tmp.close()
        evidence_path = tmp.name
        temp_files.append(tmp.name)
    comments.append(Comment(
        user_name=p["displayName"],
        text_content=p["text"],
        user_id=p["did"],
        evidence_path=evidence_path,
    ))
# "p" as in "post"

output_path = "output.mp4"
render_comment_list(comments, output_filename=output_path)

for path in temp_files:
    os.remove(path)

print(output_path)

