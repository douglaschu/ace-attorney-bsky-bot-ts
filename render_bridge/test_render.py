import os
os.environ["oe_bypass_sentiment"] = "1"

from objection_engine.renderer import render_comment_list
from objection_engine.beans.comment import Comment

comments = [
    Comment(user_name="Lawyer", text_content="Robert, if released, would you pose any threat to one Bart Simpson?"),
    Comment(user_name="Sideshow Bob", text_content="Bart Simpson? The spirited little scamp who twice foiled my evil schemes and sent me to this dank, urine-soaked hellhole?"),
    Comment(user_name="Jury Foreman", text_content="We object to the term 'urine-soaked hellhole' when you could have said 'peepee-soaked heck-hole."),
    Comment(user_name="Sideshow Bob", text_content="Cheerfully withdrawn."),
    Comment(user_name="Lawyer", text_content="What about that tattoo on your chest? Doesn't it say 'Die, Bart, Die'?"),
    Comment(user_name="Sideshow Bob", text_content="No. That's German for 'The, Bart, The.'"),
    Comment(user_name="Jury Foreman", text_content="No one who speaks German can be an evil man.")
]

render_comment_list(comments)