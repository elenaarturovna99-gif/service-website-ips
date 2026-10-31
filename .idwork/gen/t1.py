import sys; sys.path.insert(0,'/app/webapp/.idwork/gen')
from draw import *
from regions import R
S=Sheet()
S.rect(20,5,395,287,lw=0.6)
T=S.import_rd('/app/webapp/.idwork/pg11.pkl',R['МО1'],(60,820,960,1665),(22,62,250,223))
S.save('/tmp/id/out/t1.pdf','/tmp/id/out/t1.dxf')
