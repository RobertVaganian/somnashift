from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import subprocess
import tempfile
root=Path(__file__).resolve().parents[1]
shots=root/'docs/screenshots/portfolio'
media=root/'dist/media';media.mkdir(exist_ok=True)
temp=tempfile.TemporaryDirectory(prefix='somnashift-walkthrough-');work=Path(temp.name)
def face(prefix,weight):return (str(next((root/'dist/fonts').glob(prefix+'*.woff2'))),weight)
def font(spec,size):
 f=ImageFont.truetype(spec[0],size)
 f.set_variation_by_axes([spec[1] if axis['name']==b'Weight' else 48 if axis['name']==b'Optical Size' else axis['default'] for axis in f.get_variation_axes()])
 return f
sans=face('source-sans',400);bold=face('source-sans',600);display=face('newsreader',450)
steps=[('01-prepare','One shift.\nFour patient stories.','Start with a structured note and the follow-ups that still need an owner.'),('02-review','A named colleague.\nAn exact version.','Review before sending. Delivery, viewing and acknowledgment stay separate.'),('03-clarify','Clarify the gap.','A question stays with its patient and handoff version.'),('04-acknowledge','Review, then\nacknowledge.','Confirm the information actually reviewed. Unanswered questions pause this step.'),('05-update','Keep the update\nvisible.','v1 keeps its earlier confirmation. v2 presents the added information for a fresh review.'),('06-work','Record the\nfollow-through.','Add a factual work result with its author and time, separately from the submitted handoff.'),('07-history','Keep the record.','A completion has a traceable result. A correction appends another record.')]
def wrap(draw,txt,font,width):
 out=[]
 for para in txt.split('\n'):
  line=''
  for word in para.split():
   candidate=(line+' '+word).strip()
   if draw.textlength(candidate,font=font)>width and line:out.append(line);line=word
   else:line=candidate
  out.append(line)
 return out
for i,(name,title,body) in enumerate(steps):
 canvas=Image.new('RGB',(1280,960),'#f6f1eb');d=ImageDraw.Draw(canvas)
 d.text((64,62),'SOMNASHIFT',font=font(bold,22),fill='#854e40');d.text((64,112),'A mobile shift-handoff concept',font=font(sans,24),fill='#70605a')
 d.line((64,198,660,198),fill='#d8cbc1',width=1);d.text((64,232),f'0{i+1} / 07',font=font(bold,20),fill='#854e40')
 y=310
 for line in wrap(d,title,font(display,58),650):d.text((64,y),line,font=font(display,58),fill='#342c29');y+=67
 y+=38
 for line in wrap(d,body,font(sans,28),620):d.text((64,y),line,font=font(sans,28),fill='#70605a');y+=42
 d.text((64,842),'Robert Vaganian · Product design',font=font(bold,20),fill='#342c29');d.text((64,879),'Edited prototype captures · Fictional data',font=font(sans,18),fill='#70605a')
 screen=Image.open(shots/(name+'.jpg'));screen.thumbnail((424,888),Image.Resampling.LANCZOS);canvas.paste(screen,(800,32));canvas.save(work/f'slide-{i}.png');
 if i==0:canvas.save(media/'walkthrough-poster.jpg',quality=94)
# A small ordered overview for the review notes; each individual capture remains available.
contact=Image.new('RGB',(1360,1330),'#f6f1eb');d=ImageDraw.Draw(contact)
for i,(name,title,body) in enumerate(steps):
 x=30+(i%4)*335;y=25+(i//4)*650;screen=Image.open(shots/(name+'.jpg'));screen.thumbnail((270,570),Image.Resampling.LANCZOS);contact.paste(screen,(x,y+38));d.text((x+8,y),f'{i+1:02d} · {name.split("-",1)[1].title()}',font=font(bold,19),fill='#342c29')
contact.save(shots/'flow-overview.jpg',quality=94)
args=['ffmpeg','-y','-hide_banner','-loglevel','error']
for i in range(7):args+=['-loop','1','-framerate','24','-t','5.3','-i',str(work/f'slide-{i}.png')]
filters=[]
for i in range(7):filters.append(f'[{i}:v]format=yuv420p,settb=AVTB[v{i}]')
prev='v0'
for i in range(1,7):out=f'x{i}';filters.append(f'[{prev}][v{i}]xfade=transition=fade:duration=0.35:offset={4.95*i:.2f}[{out}]');prev=out
args+=['-filter_complex_threads','1','-filter_complex',';'.join(filters),'-map',f'[{prev}]','-t','35','-an','-c:v','libx264','-threads','2','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(media/'walkthrough.mp4')]
subprocess.run(args,check=True)
vtt=['WEBVTT','']
for i,(_,title,body) in enumerate(steps):
 def stamp(t):return f'00:{int(t)//60:02d}:{int(t)%60:02d}.{int(round(t%1*1000)):03d}'
 vtt += [str(i+1),f'{stamp(i*4.95)} --> {stamp(35 if i==6 else (i+1)*4.95)}',title.replace('\n',' ')+' '+body,'']
(media/'walkthrough.vtt').write_text('\n'.join(vtt))
print('Created 35-second edited walkthrough, poster, captions and ordered screenshot set.')
