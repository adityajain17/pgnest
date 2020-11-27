from wordcloud import WordCloud, STOPWORDS 
import matplotlib.pyplot as plt
import sys
stopwords = set(STOPWORDS) 
reviews=sys.argv[1]
# reviews='''The condition of the rooms were very bad. Bed sheets, linens were dirty.
# Toilet was horrible. Ambience was very bad.
# Could not stay a single night but paid Rs, 1900/ advance whice was not repaid. Overall a horrible experience for two hours.
# C.K.Roy Lovely hotel. Very comfortable. 10 minute walk to the old town. Breakfast was really good. Would definitely stay again excellent stay, except WIFI is a bit slow in our 
# room, probably due to its position. Otherwise, a good hotel, with good position excellent stay, except WIFI is a bit slow in our room, probably due to its position. Otherwise, 
# a good hotel, with good position for staying purpose its good and i found even the food 
# is quite k, but the room service is bad! Every time you havve tell them to clean the room it must be their duty to ask everyday to clean the room by them selves, at-least by noon 
# It was not satisfactory as the room facilities were not good at all and there was not a 
# single coat hanger available; but food was ok ! The room was not proprly maintained;Taxi service was not convenient'''
comment_words=''
tokens=reviews.split(' ')
for i in range(len(tokens)):
    tokens[i]=tokens[i].lower()
    
comment_words += " ".join(tokens)+" "

wordcloud = WordCloud(width = 800, height = 800, 
                background_color ='white', 
                stopwords = stopwords, 
                min_font_size = 10).generate(comment_words)


wordcloud.to_file("public/assets/word-"+sys.argv[2]+".png")