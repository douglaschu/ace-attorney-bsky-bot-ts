import os
os.environ["oe_bypass_sentiment"] = "1"

import sys
import json
from objection_engine.renderer import render_comment_list
from objection_engine.beans.comment import Comment

# reads JSON output from Typescript piped into script as single string, parsing it into a Python list of key-value pairs
data = json.loads(sys.stdin.read())
comments = [Comment(user_name=p["handle"], text_content=p["text"], user_id=p["did"]) for p in data]
# "p" as in "post"

output_path = "output.mp4"
render_comment_list(comments, output_filename=output_path)
print(output_path)

